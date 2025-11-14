import { TranscriptWord, TranscriptSegment } from '../types/cassette';
import OpenAI from 'openai';
import NetworkService from './NetworkService';
import OfflineQueueService from './OfflineQueueService';

// Initialize OpenAI client
// TODO: Add your API key to .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
});

/**
 * Service for AI transcription and summary generation using OpenAI Whisper
 * Whisper is best for elderly/unclear voices with background noise
 */
export class TranscriptionService {
  
  /**
   * Transcribe audio file to text with word-level timestamps using OpenAI Whisper
   * Whisper is specifically trained for difficult audio including elderly voices
   * If offline, queues the transcription for later processing
   */
  static async transcribeAudio(
    audioUri: string, 
    snippetId: string, 
    startTime: number,
    cassetteId?: string
  ): Promise<TranscriptSegment> {
    try {
      // Check if online before attempting transcription
      if (!NetworkService.isConnected()) {
        console.log('Offline: Queueing transcription for later');
        
        if (cassetteId) {
          await OfflineQueueService.addTranscription(cassetteId, audioUri);
        }

        // Return pending placeholder
        const mockWords: TranscriptWord[] = [
          { word: '[Transcription', startTime: startTime + 0, endTime: startTime + 300, snippetId, confidence: 0.0 },
          { word: 'pending...]', startTime: startTime + 300, endTime: startTime + 800, snippetId, confidence: 0.0 },
        ];

        return {
          id: `segment_${snippetId}`,
          text: '[Transcription pending - will process when online]',
          words: mockWords,
          startTime,
          endTime: startTime + 800,
        };
      }

      console.log('Transcribing audio with Whisper:', audioUri);

      // Convert file URI to File object for OpenAI
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const file = new File([blob], 'audio.m4a', { type: 'audio/m4a' });

      // Call OpenAI Whisper API with word-level timestamps
      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word'],
        language: 'en', // Change to auto-detect: remove this line for multilingual
      });

      // Map Whisper response to our format
      const words: TranscriptWord[] = (transcription.words || []).map((word: any) => ({
        word: word.word,
        startTime: startTime + (word.start * 1000), // Convert to ms and offset
        endTime: startTime + (word.end * 1000),
        snippetId,
        confidence: 1.0, // Whisper doesn't provide confidence scores
      }));

      const segment: TranscriptSegment = {
        id: `segment_${snippetId}`,
        text: transcription.text,
        words,
        startTime,
        endTime: words.length > 0 ? words[words.length - 1].endTime : startTime,
      };

      console.log(`Transcribed: "${transcription.text}"`);
      return segment;
      
    } catch (error) {
      console.error('Whisper transcription failed:', error);
      
      // If error is network-related and we have a cassetteId, queue it
      if (cassetteId && this.isNetworkError(error)) {
        console.log('Network error detected: Queueing transcription for retry');
        await OfflineQueueService.addTranscription(cassetteId, audioUri);
      }
      
      // Fallback to mock data if API fails
      const mockWords: TranscriptWord[] = [
        { word: '[Transcription', startTime: startTime + 0, endTime: startTime + 300, snippetId, confidence: 0.0 },
        { word: 'unavailable]', startTime: startTime + 300, endTime: startTime + 800, snippetId, confidence: 0.0 },
      ];

      return {
        id: `segment_${snippetId}`,
        text: '[Transcription unavailable - check internet connection]',
        words: mockWords,
        startTime,
        endTime: startTime + 800,
      };
    }
  }

  /**
   * Generate AI summary from transcript segments using GPT-4
   * Creates a concise summary of the recorded story
   * If offline, queues the summary for later processing
   */
  static async generateSummary(segments: TranscriptSegment[], cassetteId?: string): Promise<string> {
    try {
      const fullText = segments.map(s => s.text).join(' ');
      
      if (!fullText || fullText.trim().length === 0) {
        return 'Empty recording';
      }

      // Check if online before attempting summary generation
      if (!NetworkService.isConnected()) {
        console.log('Offline: Queueing summary generation for later');
        
        if (cassetteId) {
          await OfflineQueueService.addSummary(cassetteId, fullText);
        }

        return 'Summary pending - will generate when online';
      }

      console.log('Generating summary with GPT-4...');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Fast and cost-effective
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, empathetic summaries of personal stories and memories. Keep summaries under 50 words and capture the key themes and emotions.',
          },
          {
            role: 'user',
            content: `Please summarize this recorded story:\n\n${fullText}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const summary = completion.choices[0]?.message?.content || 'Summary unavailable';
      console.log(`Generated summary: "${summary}"`);
      return summary;
      
    } catch (error) {
      console.error('Summary generation failed:', error);
      
      const fullText = segments.map(s => s.text).join(' ');

      // If error is network-related and we have a cassetteId, queue it
      if (cassetteId && this.isNetworkError(error)) {
        console.log('Network error detected: Queueing summary for retry');
        await OfflineQueueService.addSummary(cassetteId, fullText);
        return 'Summary pending - will generate when online';
      }
      
      // Fallback to simple summary
      const wordCount = fullText.split(' ').length;
      const duration = segments[segments.length - 1]?.endTime ?? 0;
      
      return `Recording contains ${wordCount} words over ${Math.round(duration / 1000)} seconds.`;
    }
  }

  /**
   * Check if an error is network-related
   */
  private static isNetworkError(error: any): boolean {
    if (!error) return false;
    
    const errorString = error.toString().toLowerCase();
    const message = error.message?.toLowerCase() || '';
    
    return (
      errorString.includes('network') ||
      errorString.includes('fetch') ||
      errorString.includes('timeout') ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT'
    );
  }

  /**
   * Find the audio timestamp for a given text cursor position
   */
  static findTimestampForCursorPosition(
    segments: TranscriptSegment[],
    cursorPosition: number
  ): number {
    let currentPosition = 0;

    for (const segment of segments) {
      for (const word of segment.words) {
        const wordLength = word.word.length;
        
        // Check if cursor is within this word (including space after)
        if (cursorPosition >= currentPosition && cursorPosition <= currentPosition + wordLength + 1) {
          return word.startTime;
        }
        
        currentPosition += wordLength + 1; // +1 for space
      }
    }

    // Return the last timestamp if cursor is at the end
    const lastSegment = segments[segments.length - 1];
    return lastSegment?.endTime ?? 0;
  }

  /**
   * Find the text cursor position for a given audio timestamp
   */
  static findCursorPositionForTimestamp(
    segments: TranscriptSegment[],
    timestamp: number
  ): number {
    let position = 0;

    for (const segment of segments) {
      for (const word of segment.words) {
        if (timestamp >= word.startTime && timestamp <= word.endTime) {
          return position;
        }
        position += word.word.length + 1; // +1 for space
      }
    }

    return position;
  }

  /**
   * Insert new transcript segment at a specific position
   */
  static insertSegmentAtPosition(
    segments: TranscriptSegment[],
    newSegment: TranscriptSegment,
    insertPosition: number
  ): TranscriptSegment[] {
    // Find where to insert based on timestamp
    const insertIndex = segments.findIndex(s => s.startTime > insertPosition);
    
    if (insertIndex === -1) {
      // Insert at end
      return [...segments, newSegment];
    }

    // Insert at position and adjust timestamps of following segments
    const result = [...segments];
    result.splice(insertIndex, 0, newSegment);

    // Adjust subsequent segment timestamps
    const offset = newSegment.endTime - newSegment.startTime;
    for (let i = insertIndex + 1; i < result.length; i++) {
      result[i] = {
        ...result[i],
        startTime: result[i].startTime + offset,
        endTime: result[i].endTime + offset,
        words: result[i].words.map(w => ({
          ...w,
          startTime: w.startTime + offset,
          endTime: w.endTime + offset,
        })),
      };
    }

    return result;
  }
}

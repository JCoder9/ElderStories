import { TranscriptWord, TranscriptSegment } from '../types/cassette';

/**
 * Service for AI transcription and summary generation
 * Note: This is a placeholder - you'll need to integrate with a real AI service
 * Options: OpenAI Whisper API, Google Cloud Speech-to-Text, Azure Speech Services
 */
export class TranscriptionService {
  
  /**
   * Transcribe audio file to text with word-level timestamps
   * TODO: Integrate with actual AI transcription service (e.g., OpenAI Whisper)
   */
  static async transcribeAudio(audioUri: string, snippetId: string, startTime: number): Promise<TranscriptSegment> {
    // Placeholder implementation
    // In production, send audio to transcription API
    
    console.log('Transcribing audio:', audioUri);

    // Mock transcription for development
    const mockWords: TranscriptWord[] = [
      { word: 'This', startTime: startTime + 0, endTime: startTime + 200, snippetId, confidence: 0.95 },
      { word: 'is', startTime: startTime + 200, endTime: startTime + 350, snippetId, confidence: 0.98 },
      { word: 'a', startTime: startTime + 350, endTime: startTime + 450, snippetId, confidence: 0.99 },
      { word: 'test', startTime: startTime + 450, endTime: startTime + 800, snippetId, confidence: 0.92 },
      { word: 'recording', startTime: startTime + 800, endTime: startTime + 1500, snippetId, confidence: 0.96 },
    ];

    const segment: TranscriptSegment = {
      id: `segment_${snippetId}`,
      text: mockWords.map(w => w.word).join(' '),
      words: mockWords,
      startTime,
      endTime: startTime + 1500,
    };

    return segment;
  }

  /**
   * Generate AI summary from transcript segments
   * TODO: Integrate with AI service (e.g., OpenAI GPT-4, Claude)
   */
  static async generateSummary(segments: TranscriptSegment[]): Promise<string> {
    // Placeholder implementation
    // In production, send full transcript to AI for summarization
    
    const fullText = segments.map(s => s.text).join(' ');
    console.log('Generating summary for:', fullText);

    // Mock summary for development
    const wordCount = fullText.split(' ').length;
    const duration = segments[segments.length - 1]?.endTime ?? 0;
    
    return `Recording contains ${wordCount} words over ${Math.round(duration / 1000)} seconds. [AI summary will be generated here]`;
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

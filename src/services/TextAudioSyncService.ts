import { TranscriptSegment, TranscriptWord, AudioSnippet } from '../types/cassette';

/**
 * Service for managing synchronized text and audio editing operations
 * Handles the relationship between transcript words and audio timestamps
 */
export class TextAudioSyncService {
  
  /**
   * Find which words correspond to a text selection
   * @param segments - All transcript segments
   * @param selectionStart - Character position where selection starts
   * @param selectionEnd - Character position where selection ends
   * @returns Array of words in the selection with their timestamps
   */
  static getWordsInSelection(
    segments: TranscriptSegment[],
    selectionStart: number,
    selectionEnd: number
  ): { words: TranscriptWord[]; startTime: number; endTime: number } {
    const allWords: TranscriptWord[] = [];
    segments.forEach(seg => allWords.push(...seg.words));
    
    // Build character position map
    let charPosition = 0;
    const selectedWords: TranscriptWord[] = [];
    
    for (const word of allWords) {
      const wordStart = charPosition;
      const wordEnd = charPosition + word.word.length;
      
      // Check if word overlaps with selection
      if (wordEnd >= selectionStart && wordStart <= selectionEnd) {
        selectedWords.push(word);
      }
      
      charPosition = wordEnd + 1; // +1 for space
    }
    
    if (selectedWords.length === 0) {
      return { words: [], startTime: 0, endTime: 0 };
    }
    
    return {
      words: selectedWords,
      startTime: selectedWords[0].startTime,
      endTime: selectedWords[selectedWords.length - 1].endTime,
    };
  }
  
  /**
   * Split transcript segments at a specific time
   * Used when cutting or deleting audio
   */
  static splitSegmentsAtTime(
    segments: TranscriptSegment[],
    splitTime: number
  ): { before: TranscriptSegment[]; after: TranscriptSegment[] } {
    const before: TranscriptSegment[] = [];
    const after: TranscriptSegment[] = [];
    
    for (const segment of segments) {
      if (segment.endTime <= splitTime) {
        before.push(segment);
      } else if (segment.startTime >= splitTime) {
        after.push(segment);
      } else {
        // Segment spans the split point - need to split it
        const beforeWords = segment.words.filter(w => w.endTime <= splitTime);
        const afterWords = segment.words.filter(w => w.startTime >= splitTime);
        
        if (beforeWords.length > 0) {
          before.push({
            ...segment,
            words: beforeWords,
            text: beforeWords.map(w => w.word).join(' '),
            endTime: beforeWords[beforeWords.length - 1].endTime,
          });
        }
        
        if (afterWords.length > 0) {
          after.push({
            ...segment,
            words: afterWords,
            text: afterWords.map(w => w.word).join(' '),
            startTime: afterWords[0].startTime,
          });
        }
      }
    }
    
    return { before, after };
  }
  
  /**
   * Remove words from segments based on time range
   * Used for delete operations
   */
  static deleteTimeRange(
    segments: TranscriptSegment[],
    startTime: number,
    endTime: number
  ): TranscriptSegment[] {
    const result: TranscriptSegment[] = [];
    
    for (const segment of segments) {
      // Segment is completely before deletion range
      if (segment.endTime <= startTime) {
        result.push(segment);
        continue;
      }
      
      // Segment is completely after deletion range
      if (segment.startTime >= endTime) {
        result.push(segment);
        continue;
      }
      
      // Segment overlaps deletion range - filter out words in range
      const remainingWords = segment.words.filter(
        w => w.endTime <= startTime || w.startTime >= endTime
      );
      
      if (remainingWords.length > 0) {
        result.push({
          ...segment,
          words: remainingWords,
          text: remainingWords.map(w => w.word).join(' '),
          startTime: remainingWords[0].startTime,
          endTime: remainingWords[remainingWords.length - 1].endTime,
        });
      }
    }
    
    return result;
  }
  
  /**
   * Extract segments in a time range
   * Used for cut/copy operations
   */
  static extractTimeRange(
    segments: TranscriptSegment[],
    startTime: number,
    endTime: number
  ): TranscriptSegment[] {
    const result: TranscriptSegment[] = [];
    
    for (const segment of segments) {
      // Skip if segment is completely outside range
      if (segment.endTime <= startTime || segment.startTime >= endTime) {
        continue;
      }
      
      // Extract words in range
      const wordsInRange = segment.words.filter(
        w => w.startTime >= startTime && w.endTime <= endTime
      );
      
      if (wordsInRange.length > 0) {
        result.push({
          ...segment,
          words: wordsInRange,
          text: wordsInRange.map(w => w.word).join(' '),
          startTime: wordsInRange[0].startTime,
          endTime: wordsInRange[wordsInRange.length - 1].endTime,
        });
      }
    }
    
    return result;
  }
  
  /**
   * Adjust timestamps after a time shift
   * Used when reordering snippets
   */
  static shiftTimestamps(
    segments: TranscriptSegment[],
    offsetMs: number
  ): TranscriptSegment[] {
    return segments.map(segment => ({
      ...segment,
      startTime: segment.startTime + offsetMs,
      endTime: segment.endTime + offsetMs,
      words: segment.words.map(word => ({
        ...word,
        startTime: word.startTime + offsetMs,
        endTime: word.endTime + offsetMs,
      })),
    }));
  }
  
  /**
   * Rebuild transcript from reordered snippets
   * Recalculates all timestamps based on new snippet order
   */
  static rebuildFromSnippets(
    snippets: AudioSnippet[],
    segmentsBySnippet: Map<string, TranscriptSegment[]>
  ): TranscriptSegment[] {
    const result: TranscriptSegment[] = [];
    let currentTime = 0;
    
    for (const snippet of snippets) {
      const segments = segmentsBySnippet.get(snippet.id) || [];
      const shifted = this.shiftTimestamps(segments, currentTime - snippet.startTime);
      result.push(...shifted);
      currentTime += snippet.duration;
    }
    
    return result;
  }
}

/**
 * Core type definitions for cassette files and audio snippets
 */

export interface AudioSnippet {
  id: string;
  filename: string; // e.g., "snippet_001.m4a"
  startTime: number; // Position in full timeline (ms)
  duration: number; // Length of snippet (ms)
  order: number; // Order in timeline
}

export interface TranscriptWord {
  word: string;
  startTime: number; // ms from start of full recording
  endTime: number; // ms from start of full recording
  snippetId: string; // Which audio snippet this belongs to
  confidence?: number; // Transcription confidence (0-1)
}

export interface TranscriptSegment {
  id: string;
  text: string;
  words: TranscriptWord[];
  startTime: number;
  endTime: number;
}

export interface CassetteMetadata {
  id: string;
  title: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  duration: number; // Total duration in ms
  summary?: string; // AI-generated summary
  thumbnailPath?: string;
}

export interface CassetteData {
  metadata: CassetteMetadata;
  audioSnippets: AudioSnippet[];
  transcript: TranscriptSegment[];
}

/**
 * Structure of .cass file (ZIP archive):
 * 
 * cassette.cass/
 * ├── metadata.json          (CassetteMetadata)
 * ├── audio/
 * │   ├── snippet_001.m4a
 * │   ├── snippet_002.m4a
 * │   └── snippet_003.m4a
 * └── transcript.json        (TranscriptSegment[])
 */

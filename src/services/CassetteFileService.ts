import * as FileSystem from 'expo-file-system';
import { Paths, Directory } from 'expo-file-system';
import { zip, unzip } from 'react-native-zip-archive';
import { CassetteData, CassetteMetadata, AudioSnippet, TranscriptSegment } from '../types/cassette';

// Use new expo-file-system API
const getTapeRecordingsDir = () => {
  const dir = new Directory(Paths.document, 'TapeRecordings');
  return dir.uri;
};

const TAPE_RECORDINGS_DIR = getTapeRecordingsDir();

/**
 * Service for managing .cass files (ZIP-based cassette container format)
 */
export class CassetteFileService {
  static TAPE_RECORDINGS_DIR = TAPE_RECORDINGS_DIR;
  
  /**
   * Initialize the TapeRecordings directory
   */
  static async initialize(): Promise<void> {
    const dir = new Directory(Paths.document, 'TapeRecordings');
    if (!dir.exists) {
      dir.create();
    }
  }

  /**
   * Save a cassette to a .cass file
   */
  static async saveCassette(cassetteData: CassetteData, audioFiles: { [snippetId: string]: string }): Promise<string> {
    await this.initialize();

    const cassetteName = `${cassetteData.metadata.id}.cass`;
    const tempDir = new Directory(Paths.cache, cassetteData.metadata.id);
    const audioDir = new Directory(tempDir, 'audio');

    try {
      // Create temporary directory structure
      tempDir.create();
      audioDir.create();

      // Write metadata.json
      const metadataFile = new FileSystem.File(tempDir, 'metadata.json');
      await metadataFile.write(JSON.stringify(cassetteData.metadata, null, 2));

      // Write transcript.json
      const transcriptFile = new FileSystem.File(tempDir, 'transcript.json');
      await transcriptFile.write(JSON.stringify(cassetteData.transcript, null, 2));

      // Copy audio files
      for (const snippet of cassetteData.audioSnippets) {
        const sourceUri = audioFiles[snippet.id];
        if (sourceUri) {
          const sourceFile = new FileSystem.File(sourceUri);
          const destFile = new FileSystem.File(audioDir, snippet.filename);
          await sourceFile.copy(destFile);
        }
      }

      // Create ZIP archive
      const tapeRecordingsDir = new Directory(Paths.document, 'TapeRecordings');
      const cassettePath = `${tapeRecordingsDir.uri}${cassetteName}`;
      await zip(tempDir.uri, cassettePath);

      // Clean up temp directory
      tempDir.delete();

      return cassettePath;
    } catch (error) {
      // Clean up on error
      if (tempDir.exists) {
        tempDir.delete();
      }
      throw error;
    }
  }

  /**
   * Load a cassette from a .cass file
   */
  static async loadCassette(cassettePath: string): Promise<{
    cassetteData: CassetteData;
    audioFiles: { [snippetId: string]: string };
  }> {
    const tempDir = new Directory(Paths.cache, `temp_cassette_${Date.now()}`);

    try {
      // Unzip the cassette file
      await unzip(cassettePath, tempDir.uri);

      // Read metadata
      const metadataFile = new FileSystem.File(tempDir, 'metadata.json');
      const metadataJson = await metadataFile.text();
      const metadata: CassetteMetadata = JSON.parse(metadataJson);

      // Read transcript
      const transcriptFile = new FileSystem.File(tempDir, 'transcript.json');
      const transcriptJson = await transcriptFile.text();
      const transcript: TranscriptSegment[] = JSON.parse(transcriptJson);

      // Get audio files
      const audioDir = new Directory(tempDir, 'audio');
      const audioItems = audioDir.list();
      
      const audioSnippets: AudioSnippet[] = [];
      const audioFiles: { [snippetId: string]: string } = {};

      for (const item of audioItems) {
        if (item instanceof FileSystem.File) {
          const filename = item.name;
          // Extract snippet info from filename (e.g., "snippet_001.m4a")
          const match = filename.match(/snippet_(\d+)/);
          if (match) {
            const snippetId = `snippet_${match[1]}`;
            
            audioSnippets.push({
              id: snippetId,
              filename,
              startTime: 0, // Will be set from transcript data
              duration: 0, // Will be set from actual audio file
              order: parseInt(match[1])
            });

            audioFiles[snippetId] = item.uri;
          }
        }
      }

      const cassetteData: CassetteData = {
        metadata,
        audioSnippets: audioSnippets.sort((a, b) => a.order - b.order),
        transcript
      };

      return { cassetteData, audioFiles };
    } catch (error) {
      // Clean up temp directory
      if (tempDir.exists) {
        tempDir.delete();
      }
      throw error;
    }
  }

  /**
   * List all cassette files
   */
  static async listCassettes(): Promise<CassetteMetadata[]> {
    await this.initialize();

    const tapeRecordingsDir = new Directory(Paths.document, 'TapeRecordings');
    const items = tapeRecordingsDir.list();
    const cassetteFiles = items.filter(item => 
      item instanceof FileSystem.File && item.name.endsWith('.cass')
    ) as FileSystem.File[];

    const metadataList: CassetteMetadata[] = [];

    for (const file of cassetteFiles) {
      const tempDir = new Directory(Paths.cache, `temp_metadata_${Date.now()}`);

      try {
        // Unzip just to read metadata
        await unzip(file.uri, tempDir.uri);
        const metadataFile = new FileSystem.File(tempDir, 'metadata.json');
        const metadataJson = await metadataFile.text();
        const metadata: CassetteMetadata = JSON.parse(metadataJson);
        metadataList.push(metadata);
      } catch (error) {
        console.error(`Error reading cassette ${file.name}:`, error);
      } finally {
        if (tempDir.exists) {
          tempDir.delete();
        }
      }
    }

    return metadataList.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Delete a cassette file
   */
  static async deleteCassette(cassetteId: string): Promise<void> {
    const tapeRecordingsDir = new Directory(Paths.document, 'TapeRecordings');
    const cassetteFile = new FileSystem.File(tapeRecordingsDir, `${cassetteId}.cass`);
    if (cassetteFile.exists) {
      cassetteFile.delete();
    }
  }
}

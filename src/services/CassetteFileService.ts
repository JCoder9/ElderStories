import * as FileSystem from 'expo-file-system';
import { zip, unzip } from 'react-native-zip-archive';
import { CassetteData, CassetteMetadata, AudioSnippet, TranscriptSegment } from '../types/cassette';

const TAPE_RECORDINGS_DIR = `${FileSystem.documentDirectory ?? ''}TapeRecordings/`;

/**
 * Service for managing .cass files (ZIP-based cassette container format)
 */
export class CassetteFileService {
  
  /**
   * Initialize the TapeRecordings directory
   */
  static async initialize(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(TAPE_RECORDINGS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(TAPE_RECORDINGS_DIR, { intermediates: true });
    }
  }

  /**
   * Save a cassette to a .cass file
   */
  static async saveCassette(cassetteData: CassetteData, audioFiles: { [snippetId: string]: string }): Promise<string> {
    await this.initialize();

    const cassetteName = `${cassetteData.metadata.id}.cass`;
    const tempDir = `${FileSystem.cacheDirectory ?? ''}${cassetteData.metadata.id}/`;
    const audioDir = `${tempDir}audio/`;

    try {
      // Create temporary directory structure
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });

      // Write metadata.json
      await FileSystem.writeAsStringAsync(
        `${tempDir}metadata.json`,
        JSON.stringify(cassetteData.metadata, null, 2)
      );

      // Write transcript.json
      await FileSystem.writeAsStringAsync(
        `${tempDir}transcript.json`,
        JSON.stringify(cassetteData.transcript, null, 2)
      );

      // Copy audio files
      for (const snippet of cassetteData.audioSnippets) {
        const sourceUri = audioFiles[snippet.id];
        if (sourceUri) {
          await FileSystem.copyAsync({
            from: sourceUri,
            to: `${audioDir}${snippet.filename}`
          });
        }
      }

      // Create ZIP archive
      const cassettePath = `${TAPE_RECORDINGS_DIR}${cassetteName}`;
      await zip(tempDir, cassettePath);

      // Clean up temp directory
      await FileSystem.deleteAsync(tempDir, { idempotent: true });

      return cassettePath;
    } catch (error) {
      // Clean up on error
      await FileSystem.deleteAsync(tempDir, { idempotent: true });
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
    const tempDir = `${FileSystem.cacheDirectory ?? ''}temp_cassette_${Date.now()}/`;

    try {
      // Unzip the cassette file
      await unzip(cassettePath, tempDir);

      // Read metadata
      const metadataJson = await FileSystem.readAsStringAsync(`${tempDir}metadata.json`);
      const metadata: CassetteMetadata = JSON.parse(metadataJson);

      // Read transcript
      const transcriptJson = await FileSystem.readAsStringAsync(`${tempDir}transcript.json`);
      const transcript: TranscriptSegment[] = JSON.parse(transcriptJson);

      // Get audio files
      const audioDir = `${tempDir}audio/`;
      const audioFilenames = await FileSystem.readDirectoryAsync(audioDir);
      
      const audioSnippets: AudioSnippet[] = [];
      const audioFiles: { [snippetId: string]: string } = {};

      for (const filename of audioFilenames) {
        // Extract snippet info from filename (e.g., "snippet_001.m4a")
        const match = filename.match(/snippet_(\d+)/);
        if (match) {
          const snippetId = `snippet_${match[1]}`;
          const snippetPath = `${audioDir}${filename}`;
          
          // Get audio duration (you'll need to implement this using expo-av)
          const info = await FileSystem.getInfoAsync(snippetPath);
          
          audioSnippets.push({
            id: snippetId,
            filename,
            startTime: 0, // Will be set from transcript data
            duration: 0, // Will be set from actual audio file
            order: parseInt(match[1])
          });

          audioFiles[snippetId] = snippetPath;
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
      await FileSystem.deleteAsync(tempDir, { idempotent: true });
      throw error;
    }
  }

  /**
   * List all cassette files
   */
  static async listCassettes(): Promise<CassetteMetadata[]> {
    await this.initialize();

    const files = await FileSystem.readDirectoryAsync(TAPE_RECORDINGS_DIR);
    const cassetteFiles = files.filter(file => file.endsWith('.cass'));

    const metadataList: CassetteMetadata[] = [];

    for (const file of cassetteFiles) {
      const cassettePath = `${TAPE_RECORDINGS_DIR}${file}`;
      const tempDir = `${FileSystem.cacheDirectory ?? ''}temp_metadata_${Date.now()}/`;

      try {
        // Unzip just to read metadata
        await unzip(cassettePath, tempDir);
        const metadataJson = await FileSystem.readAsStringAsync(`${tempDir}metadata.json`);
        const metadata: CassetteMetadata = JSON.parse(metadataJson);
        metadataList.push(metadata);
      } catch (error) {
        console.error(`Error reading cassette ${file}:`, error);
      } finally {
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
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
    const cassettePath = `${TAPE_RECORDINGS_DIR}${cassetteId}.cass`;
    await FileSystem.deleteAsync(cassettePath, { idempotent: true });
  }
}

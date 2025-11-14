import { Audio } from 'expo-av';

/**
 * Service for handling audio recording and playback
 * Note: Using expo-av which is deprecated in SDK 54 but still functional
 * TODO: Migrate to expo-audio hooks-based API
 */
export class AudioService {
  private static recording: Audio.Recording | null = null;
  private static sound: Audio.Sound | null = null;
  private static isRecordingActive = false;

  /**
   * Initialize audio permissions and settings
   */
  static async initialize(): Promise<void> {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }

  /**
   * Start recording audio
   */
  static async startRecording(): Promise<void> {
    try {
      if (this.isRecordingActive) {
        console.warn('Recording already in progress');
        return;
      }

      await this.initialize();

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecordingActive = true;
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return the audio file URI
   */
  static async stopRecording(): Promise<{ uri: string; duration: number }> {
    try {
      if (!this.recording || !this.isRecordingActive) {
        throw new Error('No active recording');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();

      this.isRecordingActive = false;
      this.recording = null;

      if (!uri) {
        throw new Error('Recording URI is null');
      }

      // Get duration from status if available
      const duration = status.isRecording ? 0 : status.durationMillis;

      return { uri, duration };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecordingActive = false;
      this.recording = null;
      throw error;
    }
  }

  /**
   * Play an audio snippet
   */
  static async playAudio(uri: string, onPositionUpdate?: (position: number) => void): Promise<void> {
    try {
      // Unload previous sound if exists
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPositionUpdate ? (status) => {
          if (status.isLoaded) {
            onPositionUpdate(status.positionMillis);
          }
        } : undefined
      );

      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Pause current audio playback
   */
  static async pauseAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  /**
   * Resume audio playback
   */
  static async resumeAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  /**
   * Stop audio playback
   */
  static async stopAudio(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  /**
   * Seek to a specific position in the audio
   */
  static async seekTo(positionMillis: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  /**
   * Get the duration of an audio file
   */
  static async getAudioDuration(uri: string): Promise<number> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();

      if (status.isLoaded) {
        return status.durationMillis ?? 0;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      return 0;
    }
  }

  /**
   * Check if currently recording
   */
  static isRecording(): boolean {
    return this.isRecordingActive;
  }

  /**
   * Clean up resources
   */
  static async cleanup(): Promise<void> {
    if (this.recording) {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
      this.isRecordingActive = false;
    }
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

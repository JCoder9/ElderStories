import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CassetteRecorder } from '../components/CassetteRecorder';
import { CassetteList } from '../components/CassetteList';
import { TimelineEditor } from '../components/TimelineEditor';
import { TranscriptEditor } from '../components/TranscriptEditor';
import { SetupOverlay } from '../components/SetupOverlay';
import { AudioService } from '../services/AudioService';
import { CassetteFileService } from '../services/CassetteFileService';
import { TranscriptionService } from '../services/TranscriptionService';
import NetworkService from '../services/NetworkService';
import OfflineQueueService from '../services/OfflineQueueService';
import { UserProfile } from '../services/AuthService';
import {
  CassetteData,
  CassetteMetadata,
  AudioSnippet,
  TranscriptSegment,
} from '../types/cassette';

interface MainScreenProps {
  userProfile: UserProfile;
}

export const MainScreen: React.FC<MainScreenProps> = ({ userProfile }) => {
  const [showSetup, setShowSetup] = useState(false);
  const [storageType, setStorageType] = useState<'local' | 'google-drive' | null>(null);
  const [cassettes, setCassettes] = useState<CassetteMetadata[]>([]);
  const [loadedCassette, setLoadedCassette] = useState<CassetteData | null>(null);
  const [audioFiles, setAudioFiles] = useState<{ [snippetId: string]: string }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0.5);
  const [isOnline, setIsOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    checkSetup();
    AudioService.initialize();
    initializeNetworkMonitoring();
    
    return () => {
      NetworkService.cleanup();
    };
  }, []);

  const initializeNetworkMonitoring = async () => {
    // Initialize services
    NetworkService.initialize();
    await OfflineQueueService.initialize();
    
    // Update initial state
    setIsOnline(NetworkService.isConnected());
    setQueueLength(OfflineQueueService.getQueueLength());
    
    // Listen for connection changes
    NetworkService.addConnectionChangeListener(async (connected) => {
      setIsOnline(connected);
      
      if (connected) {
        console.log('📡 Back online! Processing queued operations...');
        await processOfflineQueue();
      } else {
        console.log('📵 Went offline. Operations will be queued.');
      }
    });
  };

  const processOfflineQueue = async () => {
    try {
      await OfflineQueueService.processQueue(
        async (cassetteId: string, audioUri: string) => {
          // Process queued transcription
          console.log(`Processing queued transcription for ${cassetteId}`);
          
          // Load cassette, transcribe, and save
          const cassettePath = `${CassetteFileService.TAPE_RECORDINGS_DIR}${cassetteId}.cass`;
          const { cassetteData, audioFiles: files } = await CassetteFileService.loadCassette(cassettePath);
          
          // Find the snippet that needs transcription
          const snippet = cassetteData.audioSnippets.find(s => files[s.id] === audioUri);
          if (snippet) {
            const transcriptSegment = await TranscriptionService.transcribeAudio(
              audioUri,
              snippet.id,
              snippet.startTime
            );
            
            // Update transcript
            const updatedTranscript = cassetteData.transcript.map(seg => 
              seg.id === `segment_${snippet.id}` ? transcriptSegment : seg
            );
            
            const updatedCassette: CassetteData = {
              ...cassetteData,
              transcript: updatedTranscript,
              metadata: {
                ...cassetteData.metadata,
                updatedAt: new Date().toISOString(),
              },
            };
            
            await CassetteFileService.saveCassette(updatedCassette, files);
            console.log(`✓ Transcription updated for ${cassetteId}`);
          }
        },
        async (cassetteId: string, text: string) => {
          // Process queued summary
          console.log(`Processing queued summary for ${cassetteId}`);
          
          const cassettePath = `${CassetteFileService.TAPE_RECORDINGS_DIR}${cassetteId}.cass`;
          const { cassetteData, audioFiles: files } = await CassetteFileService.loadCassette(cassettePath);
          
          const summary = await TranscriptionService.generateSummary(cassetteData.transcript);
          
          const updatedCassette: CassetteData = {
            ...cassetteData,
            metadata: {
              ...cassetteData.metadata,
              summary,
              updatedAt: new Date().toISOString(),
            },
          };
          
          await CassetteFileService.saveCassette(updatedCassette, files);
          console.log(`✓ Summary updated for ${cassetteId}`);
          
          return summary;
        }
      );
      
      // Update queue length and reload cassettes
      setQueueLength(OfflineQueueService.getQueueLength());
      await loadCassettes();
      
      if (OfflineQueueService.getQueueLength() === 0) {
        Alert.alert('✓ Synced', 'All pending operations completed!');
      }
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  };

  const checkSetup = async () => {
    const setupComplete = await AsyncStorage.getItem('setup_complete');
    const savedStorageType = await AsyncStorage.getItem('storage_type') as 'local' | 'google-drive' | null;
    
    if (!setupComplete) {
      setShowSetup(true);
    } else {
      setStorageType(savedStorageType);
      loadCassettes();
    }
  };

  const handleSetupComplete = (selectedStorageType: 'local' | 'google-drive') => {
    setStorageType(selectedStorageType);
    setShowSetup(false);
    loadCassettes();
    
    if (selectedStorageType === 'google-drive') {
      Alert.alert(
        'Google Drive Setup',
        'Google Drive integration is coming soon! For now, files will be stored locally.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadCassettes = async () => {
    try {
      const cassetteList = await CassetteFileService.listCassettes();
      setCassettes(cassetteList);
    } catch (error) {
      console.error('Failed to load cassettes:', error);
    }
  };

  const handleNewCassette = () => {
    const newCassette: CassetteData = {
      metadata: {
        id: `cassette_${Date.now()}`,
        title: `Recording ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        duration: 0,
      },
      audioSnippets: [],
      transcript: [],
    };
    setLoadedCassette(newCassette);
    setAudioFiles({});
  };

  const handleCassetteSelect = async (cassetteId: string) => {
    try {
      const cassettePath = `${CassetteFileService.TAPE_RECORDINGS_DIR}${cassetteId}.cass`;
      const { cassetteData, audioFiles: files } = await CassetteFileService.loadCassette(
        cassettePath
      );
      setLoadedCassette(cassetteData);
      setAudioFiles(files);
    } catch (error) {
      console.error('Failed to load cassette:', error);
      Alert.alert('Error', 'Failed to load cassette');
    }
  };

  const handleRecord = async () => {
    try {
      if (isRecording) {
        // Stop recording and transcribe
        const { uri, duration } = await AudioService.stopRecording();
        setIsRecording(false);
        setAudioLevel(0); // Reset audio level

        if (!loadedCassette) return;

        // Show transcribing indicator
        Alert.alert('Processing...', 'Transcribing your recording with AI');

        // Create new snippet
        const snippetId = `snippet_${Date.now()}`;
        const snippet: AudioSnippet = {
          id: snippetId,
          filename: `${snippetId}.m4a`,
          startTime: cursorPosition > 0 ? cursorPosition : loadedCassette.metadata.duration,
          duration,
          order: loadedCassette.audioSnippets.length,
        };

        // Automatically transcribe audio with Whisper (or queue if offline)
        const transcriptSegment = await TranscriptionService.transcribeAudio(
          uri,
          snippetId,
          snippet.startTime,
          loadedCassette.metadata.id,
          duration / 1000 // Convert ms to seconds
        );
        
        // Update queue length
        setQueueLength(OfflineQueueService.getQueueLength());

        // Update cassette data
        const updatedCassette: CassetteData = {
          ...loadedCassette,
          audioSnippets: [...loadedCassette.audioSnippets, snippet],
          transcript:
            cursorPosition > 0
              ? TranscriptionService.insertSegmentAtPosition(
                  loadedCassette.transcript,
                  transcriptSegment,
                  cursorPosition
                )
              : [...loadedCassette.transcript, transcriptSegment],
          metadata: {
            ...loadedCassette.metadata,
            duration: loadedCassette.metadata.duration + duration,
            updatedAt: new Date().toISOString(),
          },
        };

        setLoadedCassette(updatedCassette);
        setAudioFiles({ ...audioFiles, [snippetId]: uri });
      } else {
        // Start recording
        await AudioService.startRecording();
        setIsRecording(true);

        // Simulate audio level fluctuations for waveform
        const levelInterval = setInterval(() => {
          setAudioLevel(Math.random() * 0.7 + 0.3); // Random between 0.3-1.0
        }, 100);

        // Clean up interval when recording stops
        setTimeout(() => clearInterval(levelInterval), 100);
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to record audio');
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const handleStop = async () => {
    try {
      if (isRecording) {
        await handleRecord(); // Stop recording
      }
      if (isPlaying) {
        await AudioService.stopAudio();
        setIsPlaying(false);
        setCurrentTime(0);
      }
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const handlePlay = async () => {
    try {
      if (!loadedCassette || loadedCassette.audioSnippets.length === 0) {
        Alert.alert('No Audio', 'Please record something first');
        return;
      }

      // Find snippet at current time
      const snippet = loadedCassette.audioSnippets.find(
        (s) => currentTime >= s.startTime && currentTime < s.startTime + s.duration
      );

      if (snippet && audioFiles[snippet.id]) {
        await AudioService.playAudio(audioFiles[snippet.id], (position) => {
          setCurrentTime(snippet.startTime + position);
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const handlePause = async () => {
    try {
      await AudioService.pauseAudio();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const handleEject = async () => {
    try {
      if (!loadedCassette) return;

      // Generate summary (or queue if offline)
      const summary = await TranscriptionService.generateSummary(
        loadedCassette.transcript,
        loadedCassette.metadata.id
      );
      const updatedCassette: CassetteData = {
        ...loadedCassette,
        metadata: {
          ...loadedCassette.metadata,
          summary,
          updatedAt: new Date().toISOString(),
        },
      };
      
      // Update queue length
      setQueueLength(OfflineQueueService.getQueueLength());

      // Save cassette
      await CassetteFileService.saveCassette(updatedCassette, audioFiles);

      // Reset state
      setLoadedCassette(null);
      setAudioFiles({});
      setCurrentTime(0);
      setIsPlaying(false);

      // Reload cassette list
      await loadCassettes();

      Alert.alert('Saved', 'Cassette saved successfully');
    } catch (error) {
      console.error('Eject error:', error);
      Alert.alert('Error', 'Failed to save cassette');
    }
  };

  const handleSeek = async (time: number) => {
    setCurrentTime(time);
    if (isPlaying) {
      await AudioService.seekTo(time);
    }
  };

  const handleCursorPositionChange = (position: number) => {
    setCursorPosition(position);
    if (loadedCassette) {
      const timestamp = TranscriptionService.findTimestampForCursorPosition(
        loadedCassette.transcript,
        position
      );
      setCurrentTime(timestamp);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Setup Overlay - Shows on first launch */}
      <SetupOverlay visible={showSetup} onComplete={handleSetupComplete} />
      
      {/* Network Status Indicator */}
      {!isOnline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>
            📵 Offline - Changes will sync when back online
          </Text>
        </View>
      )}
      
      {/* Pending Operations Indicator */}
      {queueLength > 0 && (
        <View style={styles.queueBar}>
          <Text style={styles.queueText}>
            ⏳ {queueLength} pending operation{queueLength > 1 ? 's' : ''} - will process when online
          </Text>
        </View>
      )}
      
      <View style={styles.content}>
        {/* Cassette Recorder - Always Visible */}
        <CassetteRecorder
          isRecording={isRecording}
          isPlaying={isPlaying}
          audioLevel={audioLevel}
          hasCassetteLoaded={!!loadedCassette}
          onRecord={handleRecord}
          onStop={handleStop}
          onPlay={handlePlay}
          onPause={handlePause}
          onEject={handleEject}
          onRewind={() => handleSeek(Math.max(0, currentTime - 5000))}
          onFastForward={() =>
            handleSeek(
              Math.min(loadedCassette?.metadata.duration ?? 0, currentTime + 5000)
            )
          }
        />

        {/* Conditional Content: Cassette List OR Editor */}
        {!loadedCassette ? (
          <CassetteList
            cassettes={cassettes}
            onCassetteSelect={handleCassetteSelect}
            onNewCassette={handleNewCassette}
          />
        ) : (
          <>
            <TimelineEditor
              snippets={loadedCassette.audioSnippets}
              currentTime={currentTime}
              totalDuration={loadedCassette.metadata.duration}
              onSnippetPress={(snippet) => handleSeek(snippet.startTime)}
              onSnippetReorder={() => {}}
              onSeek={handleSeek}
            />
            <TranscriptEditor
              segments={loadedCassette.transcript}
              currentTime={currentTime}
              onCursorPositionChange={handleCursorPositionChange}
              onTextEdit={(newText) => {
                // Handle manual text edits
                console.log('Text edited:', newText);
              }}
              onInsertRecording={(position) => {
                setCursorPosition(position);
                handleRecord();
              }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5a4a3a', // Warm wood background
  },
  content: {
    flex: 1,
    padding: 10,
  },
  offlineBar: {
    backgroundColor: '#d97706', // Warm orange
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  queueBar: {
    backgroundColor: '#c9a87a', // Warm tan
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  queueText: {
    color: '#2a2a2a',
    fontSize: 12,
    fontWeight: '600',
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { CassetteRecorder } from '../components/CassetteRecorder';
import { CassetteList } from '../components/CassetteList';
import { TimelineEditor } from '../components/TimelineEditor';
import { TranscriptEditor } from '../components/TranscriptEditor';
import { AudioService } from '../services/AudioService';
import { CassetteFileService } from '../services/CassetteFileService';
import { TranscriptionService } from '../services/TranscriptionService';
import {
  CassetteData,
  CassetteMetadata,
  AudioSnippet,
  TranscriptSegment,
} from '../types/cassette';

export const MainScreen: React.FC = () => {
  const [cassettes, setCassettes] = useState<CassetteMetadata[]>([]);
  const [loadedCassette, setLoadedCassette] = useState<CassetteData | null>(null);
  const [audioFiles, setAudioFiles] = useState<{ [snippetId: string]: string }>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    loadCassettes();
    AudioService.initialize();
  }, []);

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
        // Stop recording
        const { uri, duration } = await AudioService.stopRecording();
        setIsRecording(false);

        if (!loadedCassette) return;

        // Create new snippet
        const snippetId = `snippet_${Date.now()}`;
        const snippet: AudioSnippet = {
          id: snippetId,
          filename: `${snippetId}.m4a`,
          startTime: cursorPosition > 0 ? cursorPosition : loadedCassette.metadata.duration,
          duration,
          order: loadedCassette.audioSnippets.length,
        };

        // Transcribe audio
        const transcriptSegment = await TranscriptionService.transcribeAudio(
          uri,
          snippetId,
          snippet.startTime
        );

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
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to record audio');
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

      // Generate summary
      const summary = await TranscriptionService.generateSummary(loadedCassette.transcript);
      const updatedCassette: CassetteData = {
        ...loadedCassette,
        metadata: {
          ...loadedCassette.metadata,
          summary,
          updatedAt: new Date().toISOString(),
        },
      };

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
      <View style={styles.content}>
        {/* Cassette Recorder - Always Visible */}
        <CassetteRecorder
          isRecording={isRecording}
          isPlaying={isPlaying}
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
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    padding: 10,
  },
});

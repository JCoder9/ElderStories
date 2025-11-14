import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

interface CassetteRecorderProps {
  isRecording: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onStop: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEject: () => void;
  onRewind: () => void;
  onFastForward: () => void;
}

/**
 * Retro cassette tape recorder UI with large buttons
 */
export const CassetteRecorder: React.FC<CassetteRecorderProps> = ({
  isRecording,
  isPlaying,
  onRecord,
  onStop,
  onPlay,
  onPause,
  onEject,
  onRewind,
  onFastForward,
}) => {
  return (
    <View style={styles.container}>
      {/* Cassette Deck Visual */}
      <View style={styles.cassetteDeck}>
        <View style={styles.cassetteWindow}>
          {/* Spinning reels visualization */}
          <View style={styles.reelContainer}>
            <View style={[styles.reel, isPlaying && styles.reelSpinning]} />
            <View style={[styles.reel, isPlaying && styles.reelSpinning]} />
          </View>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <Text style={styles.recordingText}>● REC</Text>
            </View>
          )}
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Top Row: Transport Controls */}
        <View style={styles.transportRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={onRewind}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.playButton]}
            onPress={isPlaying ? onPause : onPlay}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={onFastForward}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>⏭</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Row: Record, Stop, Eject */}
        <View style={styles.mainControlsRow}>
          <TouchableOpacity
            style={[styles.button, styles.recordButton, isRecording && styles.recordingActive]}
            onPress={onRecord}
          >
            <Text style={styles.buttonText}>●</Text>
            <Text style={styles.buttonLabel}>REC</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={onStop}
          >
            <Text style={styles.buttonText}>■</Text>
            <Text style={styles.buttonLabel}>STOP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.ejectButton]}
            onPress={onEject}
          >
            <Text style={styles.buttonText}>⏏</Text>
            <Text style={styles.buttonLabel}>EJECT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cassetteDeck: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#444',
  },
  cassetteWindow: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  reelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  reel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#666',
  },
  reelSpinning: {
    // Animation would be added with Animated API
    borderColor: '#888',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  recordingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  controlsContainer: {
    gap: 15,
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  mainControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  button: {
    backgroundColor: '#444',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#666',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playButton: {
    backgroundColor: '#2d5d2d',
    borderColor: '#3a7a3a',
  },
  recordButton: {
    backgroundColor: '#5d2d2d',
    borderColor: '#7a3a3a',
  },
  recordingActive: {
    backgroundColor: '#ff0000',
    borderColor: '#ff3333',
  },
  stopButton: {
    backgroundColor: '#3a3a3a',
    borderColor: '#555',
  },
  ejectButton: {
    backgroundColor: '#2d3d5d',
    borderColor: '#3a4a7a',
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonLabel: {
    color: '#aaa',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { AudioWaveform } from './AudioWaveform';

interface CassetteRecorderProps {
  isRecording: boolean;
  isPlaying: boolean;
  audioLevel?: number; // 0-1 value from recording metering
  hasCassetteLoaded?: boolean; // Whether a cassette is loaded
  onRecord: () => void;
  onStop: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEject: () => void;
  onRewind: () => void;
  onFastForward: () => void;
}

/**
 * Retro cassette tape recorder UI with warm wood aesthetic
 */
export const CassetteRecorder: React.FC<CassetteRecorderProps> = ({
  isRecording,
  isPlaying,
  audioLevel = 0.5,
  hasCassetteLoaded = false,
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
      {/* Wood panel background */}
      <View style={styles.woodPanel}>
        
        {/* Cassette Deck with brushed metal look */}
        <View style={styles.cassetteDeck}>
          
          {/* Cassette Window */}
          <View style={styles.cassetteWindow}>
            {hasCassetteLoaded ? (
              /* Loaded Cassette Tape */
              <View style={styles.cassetteTape}>
                {/* Cassette body */}
                <View style={styles.cassetteBody}>
                  {/* Label area */}
                  <View style={styles.cassetteLabel}>
                    <Text style={styles.cassetteLabelText}>ELDERSTORIES</Text>
                    <Text style={styles.cassetteLabelSubtext}>Voice Recording</Text>
                  </View>
                  
                  {/* Tape reels */}
                  <View style={styles.tapeReelContainer}>
                    <View style={[styles.tapeReel, isPlaying && styles.reelSpinning]}>
                      <View style={styles.reelCenter} />
                      <View style={styles.reelSpokes} />
                    </View>
                    <View style={[styles.tapeReel, isPlaying && styles.reelSpinning]}>
                      <View style={styles.reelCenter} />
                      <View style={styles.reelSpokes} />
                    </View>
                  </View>
                  
                  {/* Tape window (see the magnetic tape) */}
                  <View style={styles.tapeWindow}>
                    <View style={styles.magneticTape} />
                  </View>
                </View>
                
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>REC</Text>
                  </View>
                )}
              </View>
            ) : (
              /* Empty Deck */
              <View style={styles.emptyDeck}>
                <Text style={styles.emptyDeckText}>Insert Cassette</Text>
                <Text style={styles.emptyDeckIcon}>📼</Text>
              </View>
            )}
          </View>
          
          {/* VU Meter / Waveform Display */}
          <View style={styles.vuMeterPanel}>
            <AudioWaveform isRecording={isRecording} audioLevel={audioLevel} />
          </View>
        </View>

        {/* Control Buttons - Chunky retro style */}
        <View style={styles.controlsContainer}>
          {/* Transport Controls */}
          <View style={styles.transportRow}>
            <TouchableOpacity
              style={[styles.button, styles.transportButton]}
              onPress={onRewind}
              disabled={isRecording || !hasCassetteLoaded}
            >
              <Text style={styles.buttonIcon}>⏮</Text>
              <Text style={styles.buttonLabel}>REW</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.playButton]}
              onPress={isPlaying ? onPause : onPlay}
              disabled={isRecording || !hasCassetteLoaded}
            >
              <Text style={styles.buttonIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              <Text style={styles.buttonLabel}>{isPlaying ? 'PAUSE' : 'PLAY'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.transportButton]}
              onPress={onFastForward}
              disabled={isRecording || !hasCassetteLoaded}
            >
              <Text style={styles.buttonIcon}>⏭</Text>
              <Text style={styles.buttonLabel}>FF</Text>
            </TouchableOpacity>
          </View>

          {/* Main Controls */}
          <View style={styles.mainControlsRow}>
            <TouchableOpacity
              style={[styles.button, styles.recordButton, isRecording && styles.recordingActive]}
              onPress={onRecord}
              disabled={!hasCassetteLoaded}
            >
              <View style={[styles.recordDot, isRecording && styles.recordDotActive]} />
              <Text style={styles.buttonLabel}>RECORD</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={onStop}
            >
              <View style={styles.stopSquare} />
              <Text style={styles.buttonLabel}>STOP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.ejectButton]}
              onPress={onEject}
            >
              <Text style={styles.buttonIcon}>⏏</Text>
              <Text style={styles.buttonLabel}>EJECT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  woodPanel: {
    backgroundColor: '#4a3728', // Dark wood brown
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    // Wood grain effect with border
    borderWidth: 3,
    borderColor: '#3a2718',
  },
  cassetteDeck: {
    backgroundColor: '#c9b fa4', // Brushed metal beige
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8a7a64',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cassetteWindow: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 12,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  
  // Cassette Tape Styles
  cassetteTape: {
    width: '100%',
    alignItems: 'center',
  },
  cassetteBody: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    width: '95%',
    borderWidth: 2,
    borderColor: '#444',
  },
  cassetteLabel: {
    backgroundColor: '#f5e6d3', // Vintage paper color
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4c5b3',
  },
  cassetteLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2a2a2a',
    letterSpacing: 1,
  },
  cassetteLabelSubtext: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  tapeReelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  tapeReel: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#666',
    position: 'absolute',
  },
  reelSpokes: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 6,
    borderColor: '#1a1a1a',
    borderStyle: 'solid',
  },
  reelSpinning: {
    borderColor: '#555',
  },
  tapeWindow: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  magneticTape: {
    height: '100%',
    width: '60%',
    backgroundColor: '#8b4513', // Brown magnetic tape
  },
  
  // Empty Deck
  emptyDeck: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyDeckText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  emptyDeckIcon: {
    fontSize: 48,
    opacity: 0.3,
  },
  
  // Recording Indicator
  recordingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 20, 20, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recordingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  
  // VU Meter Panel
  vuMeterPanel: {
    marginTop: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  // Controls
  controlsContainer: {
    gap: 16,
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  mainControlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    backgroundColor: '#d4a574', // Warm tan/beige
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderTopColor: '#e6c9a0',
    borderLeftColor: '#e6c9a0',
    borderRightColor: '#a67c52',
    borderBottomColor: '#a67c52',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  transportButton: {
    backgroundColor: '#c9a87a',
  },
  playButton: {
    backgroundColor: '#7a9b7a', // Warm green
    borderTopColor: '#8fb08f',
    borderLeftColor: '#8fb08f',
    borderRightColor: '#5a7a5a',
    borderBottomColor: '#5a7a5a',
  },
  recordButton: {
    backgroundColor: '#c97a7a', // Warm red
    borderTopColor: '#df8f8f',
    borderLeftColor: '#df8f8f',
    borderRightColor: '#a95a5a',
    borderBottomColor: '#a95a5a',
  },
  recordingActive: {
    backgroundColor: '#dc3232',
    borderTopColor: '#ff5252',
    borderLeftColor: '#ff5252',
    borderRightColor: '#bc1212',
    borderBottomColor: '#bc1212',
  },
  stopButton: {
    backgroundColor: '#8a8a8a',
    borderTopColor: '#a0a0a0',
    borderLeftColor: '#a0a0a0',
    borderRightColor: '#6a6a6a',
    borderBottomColor: '#6a6a6a',
  },
  ejectButton: {
    backgroundColor: '#7a8fb0', // Warm blue
    borderTopColor: '#8fa4c5',
    borderLeftColor: '#8fa4c5',
    borderRightColor: '#5a6a8a',
    borderBottomColor: '#5a6a8a',
  },
  buttonIcon: {
    fontSize: 28,
    color: '#2a2a2a',
    fontWeight: 'bold',
  },
  buttonLabel: {
    color: '#2a2a2a',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  recordDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dc3232',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  recordDotActive: {
    backgroundColor: '#fff',
  },
  stopSquare: {
    width: 20,
    height: 20,
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
});

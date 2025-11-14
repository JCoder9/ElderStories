import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AudioWaveformProps {
  isRecording: boolean;
  audioLevel?: number; // 0-1 value from recording
}

/**
 * Real-time audio waveform visualization during recording
 */
export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording, audioLevel = 0 }) => {
  const [bars] = useState(() => 
    Array.from({ length: 40 }, () => new Animated.Value(0.1))
  );

  useEffect(() => {
    if (!isRecording) {
      // Reset all bars when not recording
      bars.forEach(bar => {
        Animated.timing(bar, {
          toValue: 0.1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
      return;
    }

    // Animate bars when recording
    const interval = setInterval(() => {
      bars.forEach((bar, index) => {
        // Create wave effect with some randomness
        const randomHeight = Math.random() * audioLevel * 0.8 + 0.2;
        const delay = index * 20; // Stagger animation
        
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(bar, {
            toValue: randomHeight,
            duration: 150,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isRecording, audioLevel, bars]);

  return (
    <View style={styles.container}>
      {bars.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['10%', '100%'],
              }),
              opacity: isRecording ? 1 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  bar: {
    width: 3,
    backgroundColor: '#ff0000',
    borderRadius: 2,
    minHeight: 4,
  },
});

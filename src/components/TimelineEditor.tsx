import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AudioSnippet } from '../types/cassette';

interface TimelineEditorProps {
  snippets: AudioSnippet[];
  currentTime: number;
  totalDuration: number;
  onSnippetPress: (snippet: AudioSnippet) => void;
  onSnippetReorder: (snippetId: string, newOrder: number) => void;
  onSeek: (time: number) => void;
}

/**
 * Visual timeline for arranging audio snippets
 */
export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  snippets,
  currentTime,
  totalDuration,
  onSnippetPress,
  onSeek,
}) => {
  const TIMELINE_WIDTH = 600; // Logical width for calculations
  const PIXELS_PER_MS = totalDuration > 0 ? TIMELINE_WIDTH / totalDuration : 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <Text style={styles.duration}>{formatTime(totalDuration)}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
      >
        <View style={[styles.timeline, { width: Math.max(TIMELINE_WIDTH, 600) }]}>
          {/* Time markers */}
          <View style={styles.timeMarkers}>
            {Array.from({ length: Math.ceil(totalDuration / 10000) + 1 }).map((_, i) => {
              const time = i * 10000;
              const position = time * PIXELS_PER_MS;
              return (
                <View key={i} style={[styles.marker, { left: position }]}>
                  <View style={styles.markerLine} />
                  <Text style={styles.markerText}>{formatTime(time)}</Text>
                </View>
              );
            })}
          </View>

          {/* Audio snippets */}
          <View style={styles.snippetsContainer}>
            {snippets.map((snippet) => {
              const width = snippet.duration * PIXELS_PER_MS;
              const left = snippet.startTime * PIXELS_PER_MS;

              return (
                <TouchableOpacity
                  key={snippet.id}
                  style={[
                    styles.snippet,
                    {
                      left,
                      width: Math.max(width, 30),
                    },
                  ]}
                  onPress={() => onSnippetPress(snippet)}
                >
                  <View style={styles.snippetContent}>
                    <Text style={styles.snippetText} numberOfLines={1}>
                      {snippet.filename}
                    </Text>
                    <Text style={styles.snippetDuration}>
                      {formatTime(snippet.duration)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Playhead */}
          <View
            style={[
              styles.playhead,
              { left: currentTime * PIXELS_PER_MS },
            ]}
          >
            <View style={styles.playheadLine} />
            <View style={styles.playheadHandle} />
          </View>

          {/* Clickable timeline for seeking */}
          <TouchableOpacity
            style={styles.timelineClickArea}
            activeOpacity={1}
            onPress={(e) => {
              const locationX = e.nativeEvent.locationX;
              const seekTime = locationX / PIXELS_PER_MS;
              onSeek(Math.max(0, Math.min(seekTime, totalDuration)));
            }}
          />
        </View>
      </ScrollView>

      {/* Timeline controls */}
      <View style={styles.controls}>
        <Text style={styles.currentTimeText}>{formatTime(currentTime)}</Text>
      </View>
    </View>
  );
};

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  duration: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    maxHeight: 120,
  },
  timeline: {
    height: 100,
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    flexDirection: 'row',
  },
  marker: {
    position: 'absolute',
    height: '100%',
    alignItems: 'center',
  },
  markerLine: {
    width: 1,
    height: 8,
    backgroundColor: '#ccc',
  },
  markerText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  snippetsContainer: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 50,
  },
  snippet: {
    position: 'absolute',
    height: 40,
    backgroundColor: '#4a90e2',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3a7ac2',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  snippetContent: {
    flex: 1,
    justifyContent: 'center',
  },
  snippetText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  snippetDuration: {
    fontSize: 8,
    color: '#cce5ff',
  },
  playhead: {
    position: 'absolute',
    top: 20,
    bottom: 0,
    width: 2,
    zIndex: 100,
  },
  playheadLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#ff0000',
  },
  playheadHandle: {
    position: 'absolute',
    top: -5,
    left: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff0000',
  },
  timelineClickArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controls: {
    marginTop: 10,
    alignItems: 'center',
  },
  currentTimeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

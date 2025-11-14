import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { TranscriptSegment } from '../types/cassette';

interface TranscriptEditorProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onCursorPositionChange: (position: number) => void;
  onTextEdit: (newText: string) => void;
  onInsertRecording: (position: number) => void;
}

/**
 * Text editor with word-level audio linking
 */
export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  segments,
  currentTime,
  onCursorPositionChange,
  onTextEdit,
  onInsertRecording,
}) => {
  const [cursorPosition, setCursorPosition] = useState(0);
  const fullText = segments.map((s) => s.text).join(' ');

  const handleSelectionChange = (event: any) => {
    const position = event.nativeEvent.selection.start;
    setCursorPosition(position);
    onCursorPositionChange(position);
  };

  const handleInsertRecording = () => {
    onInsertRecording(cursorPosition);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transcript</Text>
        <TouchableOpacity
          style={styles.insertButton}
          onPress={handleInsertRecording}
        >
          <Text style={styles.insertButtonText}>+ Insert Recording Here</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <TextInput
          style={styles.textInput}
          multiline
          value={fullText}
          onChangeText={onTextEdit}
          onSelectionChange={handleSelectionChange}
          placeholder="Your transcribed text will appear here. Place cursor where you want to insert new recordings."
          placeholderTextColor="#999"
        />

        {/* Word highlighting based on current playback time */}
        <View style={styles.highlightOverlay}>
          {segments.map((segment) =>
            segment.words.map((word, index) => {
              const isActive =
                currentTime >= word.startTime && currentTime <= word.endTime;

              return (
                <Text
                  key={`${segment.id}-${index}`}
                  style={[styles.word, isActive && styles.activeWord]}
                >
                  {word.word}{' '}
                </Text>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Cursor at: {cursorPosition} | Words: {fullText.split(' ').length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  insertButton: {
    backgroundColor: '#5d2d2d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  insertButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    maxHeight: 300,
  },
  textInput: {
    padding: 15,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    minHeight: 200,
  },
  highlightOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    pointerEvents: 'none',
  },
  word: {
    fontSize: 16,
    lineHeight: 24,
    color: 'transparent',
  },
  activeWord: {
    backgroundColor: '#ffeb3b',
    color: '#333',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

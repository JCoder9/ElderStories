import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { TranscriptSegment } from '../types/cassette';

interface TranscriptEditorProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onCursorPositionChange: (position: number) => void;
  onTextEdit: (newText: string) => void;
  onInsertRecording: (position: number) => void;
  onCut?: (selectionStart: number, selectionEnd: number) => void;
  onCopy?: (selectionStart: number, selectionEnd: number) => void;
  onDelete?: (selectionStart: number, selectionEnd: number) => void;
  onPaste?: (position: number) => void;
}

/**
 * Text editor with word-level audio linking and editing operations
 */
export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  segments,
  currentTime,
  onCursorPositionChange,
  onTextEdit,
  onInsertRecording,
  onCut,
  onCopy,
  onDelete,
  onPaste,
}) => {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const fullText = segments.map((s) => s.text).join(' ');

  console.log('📄 TranscriptEditor render - segments:', segments.length, 'text length:', fullText.length);

  const handleSelectionChange = (event: any) => {
    const { start, end } = event.nativeEvent.selection;
    setCursorPosition(start);
    setSelection({ start, end });
    onCursorPositionChange(start);
    
    // Show context menu if text is selected
    if (start !== end) {
      setShowContextMenu(true);
      // Position menu above the text input (top of container)
      setMenuPosition({ x: 20, y: 10 });
    } else {
      setShowContextMenu(false);
    }
  };

  const handleInsertRecording = () => {
    onInsertRecording(cursorPosition);
  };
  
  const handleCut = () => {
    if (onCut && selection.start !== selection.end) {
      onCut(selection.start, selection.end);
      setShowContextMenu(false);
    }
  };
  
  const handleCopy = () => {
    if (onCopy && selection.start !== selection.end) {
      onCopy(selection.start, selection.end);
      setShowContextMenu(false);
    }
  };
  
  const handleDelete = () => {
    if (onDelete && selection.start !== selection.end) {
      onDelete(selection.start, selection.end);
      setShowContextMenu(false);
    }
  };
  
  const handlePaste = () => {
    if (onPaste) {
      onPaste(cursorPosition);
      setShowContextMenu(false);
    }
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
        <View>
          <TextInput
            style={styles.textInput}
            multiline
            value={fullText}
            onChangeText={onTextEdit}
            onSelectionChange={handleSelectionChange}
            placeholder="Your transcribed text will appear here. Place cursor where you want to insert new recordings."
            placeholderTextColor="#999"
          />

          {/* Word highlighting overlay - only shows when playing */}
          {currentTime > 0 && (
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
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Cursor at: {cursorPosition} | Words: {fullText.split(' ').length}
        </Text>
      </View>
      
      {/* Context Menu for Text Selection */}
      {showContextMenu && (
        <View style={[styles.contextMenu, { top: menuPosition.y, left: menuPosition.x }]}>
          <TouchableOpacity style={styles.menuItem} onPress={handleCut}>
            <Text style={styles.menuText}>✂️ Cut</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleCopy}>
            <Text style={styles.menuText}>📋 Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Text style={styles.menuText}>🗑️ Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handlePaste}>
            <Text style={styles.menuText}>📌 Paste</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemCancel]} 
            onPress={() => setShowContextMenu(false)}
          >
            <Text style={styles.menuText}>✖️ Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e6d3', // Vintage paper
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d4c5b3',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#d4c5b3',
    backgroundColor: '#4a3728', // Dark wood
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f5e6d3', // Warm cream
  },
  insertButton: {
    backgroundColor: '#c97a7a', // Warm red
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderTopColor: '#df8f8f',
    borderLeftColor: '#df8f8f',
    borderRightColor: '#a95a5a',
    borderBottomColor: '#a95a5a',
  },
  insertButtonText: {
    color: '#2a2a2a',
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
    color: '#2a2a2a',
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
    backgroundColor: '#dc8532', // Warm orange highlight
    color: '#2a2a2a',
    borderRadius: 3,
  },
  footer: {
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: '#d4c5b3',
    backgroundColor: '#e6d7c3',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#5a4a3a',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d4c5b3',
  },
  menuItemCancel: {
    borderBottomWidth: 0,
    backgroundColor: '#f5e6d3',
  },
  menuText: {
    fontSize: 14,
    color: '#2a2a2a',
    fontWeight: '500',
  },
});

# Text-to-Audio Synchronization Feature - Implementation Plan

## ✅ Completed (Step 1-2)

### 1. AudioEditingService (`src/services/AudioEditingService.ts`)
- Created service with methods for:
  - `splitAudioAt()` - Split audio file at timestamp
  - `extractAudioSegment()` - Extract portion of audio
  - `deleteAudioSegment()` - Remove section from audio
  - `mergeAudioFiles()` - Combine multiple audio files
  - `getAudioDuration()` - Get audio file duration

**Note:** These are placeholder implementations. Actual audio manipulation requires native ffmpeg integration. The interface is ready for when you want to add proper audio editing.

### 2. TextAudioSyncService (`src/services/TextAudioSyncService.ts`)
- Manages relationship between transcript words and audio timestamps
- Key methods:
  - `getWordsInSelection()` - Find words in text selection with timestamps
  - `splitSegmentsAtTime()` - Split transcript at specific time
  - `deleteTimeRange()` - Remove words in time range
  - `extractTimeRange()` - Extract words in time range
  - `shiftTimestamps()` - Adjust timestamps after time shift
  - `rebuildFromSnippets()` - Reconstruct transcript from reordered snippets

### 3. TranscriptEditor with Context Menu (`src/components/TranscriptEditor.tsx`)
- Added selection tracking (`selection.start`, `selection.end`)
- Context menu appears when text is selected
- Menu options: ✂️ Cut, 📋 Copy, 🗑️ Delete, 📌 Paste, ✖️ Cancel
- New props:
  - `onCut(selectionStart, selectionEnd)`
  - `onCopy(selectionStart, selectionEnd)`
  - `onDelete(selectionStart, selectionEnd)`
  - `onPaste(position)`

## 🔄 Next Steps (To Complete Implementation)

### Step 3: Implement Cut/Copy/Delete/Paste Operations in MainScreen

Add these handlers to `MainScreen.tsx`:

```typescript
const [clipboard, setClipboard] = useState<{
  segments: TranscriptSegment[];
  audioUri: string;
} | null>(null);

const handleCut = async (selectionStart: number, selectionEnd: number) => {
  if (!loadedCassette) return;
  
  // 1. Find words in selection
  const { words, startTime, endTime } = TextAudioSyncService.getWordsInSelection(
    loadedCassette.transcript,
    selectionStart,
    selectionEnd
  );
  
  // 2. Extract audio segment (placeholder for now)
  // const audioUri = await AudioEditingService.extractAudioSegment(...);
  
  // 3. Extract transcript segments
  const extractedSegments = TextAudioSyncService.extractTimeRange(
    loadedCassette.transcript,
    startTime,
    endTime
  );
  
  // 4. Save to clipboard
  setClipboard({ segments: extractedSegments, audioUri: '' });
  
  // 5. Remove from current cassette
  const updatedTranscript = TextAudioSyncService.deleteTimeRange(
    loadedCassette.transcript,
    startTime,
    endTime
  );
  
  // 6. Update cassette
  setLoadedCassette({
    ...loadedCassette,
    transcript: updatedTranscript,
  });
};
```

### Step 4: Timeline Drag-and-Drop

Update `TimelineEditor.tsx` to support:
- Long-press on snippet → show menu (Copy/Delete)
- Drag-and-drop to reorder snippets
- Update transcript when snippets reordered

Use React Native's `PanResponder` or a library like `react-native-draggable-flatlist`.

### Step 5: Wire Everything Together

In `MainScreen.tsx`, pass the new handlers to `TranscriptEditor`:

```typescript
<TranscriptEditor
  segments={loadedCassette.transcript}
  currentTime={currentTime}
  onCursorPositionChange={handleCursorPositionChange}
  onTextEdit={handleTextEdit}
  onInsertRecording={handleInsertRecording}
  onCut={handleCut}
  onCopy={handleCopy}
  onDelete={handleDelete}
  onPaste={handlePaste}
/>
```

## 📝 Important Notes

### Audio Editing Limitation
The `AudioEditingService` currently has placeholder implementations. For production use:

**Option 1: Server-side Processing**
- Upload audio to your server
- Use ffmpeg on server to split/merge
- Download processed audio

**Option 2: Native Module (Complex)**
- Integrate ffmpeg native library
- Requires ejecting from Expo or custom development build
- Package: `ffmpeg-kit-react-native` (but deprecated)

**Option 3: Simplified Approach (Recommended for MVP)**
- Don't actually split audio files
- Just track edit operations in metadata
- When playing, skip deleted sections programmatically
- Merge happens during playback, not file-level

### Data Structure Changes Needed

Add to `CassetteData` type:
```typescript
interface CassetteData {
  // ... existing fields
  edits?: {
    type: 'cut' | 'delete';
    startTime: number;
    endTime: number;
    snippetId: string;
  }[];
  snippetOrder?: string[]; // Track reordered snippet IDs
}
```

## 🎯 Quick Win Implementation

For fastest results with current setup:

1. **Implement text-only operations first**
   - Cut/copy/paste work on transcript only
   - Show visual feedback in transcript
   - Don't modify audio files yet

2. **Add playback skip logic**
   - When playing, skip deleted sections
   - Track edits in metadata
   - Audio files stay intact

3. **Timeline reordering**
   - Drag-and-drop updates `snippetOrder` array
   - Rebuild transcript using `TextAudioSyncService.rebuildFromSnippets()`
   - Playback follows new order

This gives you 80% of the functionality without complex audio processing!

## 🚀 Testing Plan

1. Record multiple snippets
2. Select text and use Cut
3. Verify transcript updates
4. Test Paste at different positions
5. Reorder snippets in timeline
6. Play back - should follow new order
7. Save and reload cassette - edits persist

## 📚 Files Modified

- ✅ `src/services/AudioEditingService.ts` - NEW
- ✅ `src/services/TextAudioSyncService.ts` - NEW
- ✅ `src/components/TranscriptEditor.tsx` - UPDATED
- ⏳ `src/screens/MainScreen.tsx` - NEEDS UPDATE
- ⏳ `src/components/TimelineEditor.tsx` - NEEDS UPDATE
- ⏳ `src/types/cassette.ts` - NEEDS UPDATE (add edit tracking)

## 💡 Recommendation

**Start with simplified version:**
1. Complete the transcript editing (cut/copy/paste text only)
2. Add timeline reordering
3. Test user experience
4. Add audio processing later if needed

Most users won't notice if audio files aren't actually split - they just care that playback works correctly!

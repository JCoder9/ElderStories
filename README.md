# ElderStories

A retro cassette tape voice recorder app with AI-powered transcription for capturing and preserving stories.

## Features

- 🎙️ Cassette-style voice recorder interface
- 📝 Real-time AI transcription with OpenAI Whisper
- ✂️ Audio snippet timeline editor
- 🔗 Word-level audio-text linking
- 💾 Custom .cass file format (ZIP-based)
- 📱 Android & iOS support
- 📵 Full offline support - recordings and edits work without internet
- 🔄 Automatic sync when connection restored

## Tech Stack

- React Native with TypeScript
- Expo for cross-platform development
- ZIP-based .cass container format
- AI speech-to-text integration

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
ElderStories/
├── src/
│   ├── components/      # UI components (CassetteRecorder, CassetteList, etc.)
│   ├── services/        # Audio, transcription, file management
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── TapeRecordings/      # Local cassette storage (gitignored)
└── assets/              # Images, fonts
```

## .cass File Format

Cassette files are ZIP archives containing:
- `metadata.json` - Cassette info, summary, timestamps
- `audio/` - Individual audio snippets
- `transcript.json` - Text with word-level timestamps

## Offline Support

**Works completely offline!** The app automatically handles network connectivity:

- ✅ Record audio anytime (no internet needed)
- ✅ Edit cassettes and save locally
- ✅ Automatic transcription queuing when offline
- ✅ Auto-sync when back online

**How it works:**
1. When offline, recordings are saved locally with placeholder transcripts
2. Transcription and summary requests are queued
3. Orange "Offline" banner shows when disconnected
4. Blue "Pending operations" banner shows queued items
5. When reconnected, all queued operations process automatically
6. Get "✓ Synced" notification when complete

**What's queued:**
- Audio transcriptions (Whisper API)
- Summary generation (GPT-4o-mini)
- Failed network requests (auto-retry 3 times)

## License

MIT

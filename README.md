# ElderStories

A retro cassette tape voice recorder app with AI-powered transcription for capturing and preserving stories.

## Features

- 🎙️ Cassette-style voice recorder interface
- 📝 Real-time AI transcription
- ✂️ Audio snippet timeline editor
- 🔗 Word-level audio-text linking
- 💾 Custom .cass file format (ZIP-based)
- 📱 Android & iOS support

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

## License

MIT

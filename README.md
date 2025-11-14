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
- 🔐 User authentication with admin approval system
- 💰 Cost tracking with $20/month spending cap

## Tech Stack

- React Native with TypeScript
- Expo for cross-platform development
- ZIP-based .cass container format
- AI speech-to-text integration

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Firebase (Required for authentication)
See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

Quick steps:
1. Create Firebase project
2. Enable Email/Password authentication
3. Create Firestore database
4. Add Firebase config to `.env`

### 3. Setup OpenAI (Required for transcription)
See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`: `OPENAI_API_KEY=sk-proj-...`

### 4. Run the App
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 5. Create Admin Account
1. Sign up in the app with your email
2. Go to Firebase Console → Firestore
3. Find your user document
4. Set `isAdmin: true`

Now you can approve other users!

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

## User Access Control

### Three User Types:

1. **Admin Users** (You & approved admins)
   - Full access to transcriptions (shared $20/month budget)
   - Can approve other users
   - Admin panel access
   - Monitor costs and usage

2. **Approved Users** (Family members you approve)
   - Free transcriptions (shared $20/month budget)
   - All recording features
   - No admin access

3. **Regular Users** (Unapproved or want own key)
   - Can record and edit audio
   - **Cannot** use transcriptions without:
     - Admin approval, OR
     - Adding their own OpenAI API key in Settings

### Cost Protection:
- $20/month spending limit shared across approved users
- Automatic transcription disable when limit reached
- Monthly usage resets automatically
- Admin can monitor costs in Admin Panel

### Workflow:
1. **New user signs up** → Status: PENDING
2. **Admin approves** → User gets free transcriptions
3. **User exceeds $20** → Transcriptions auto-disabled until next month
4. **Alternative**: User adds personal API key → Unlimited transcriptions (they pay)

## License

MIT

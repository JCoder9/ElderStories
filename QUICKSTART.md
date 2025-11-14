# 🎙️ To Start Using AI Transcription

## Quick Setup (5 minutes)

### 1. **Install OpenAI Package**
```bash
npm install openai
```

### 2. **Get OpenAI API Key**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

### 3. **Add API Key to Project**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your key:
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

### 4. **Run the App**
```bash
npm start
```

---

## ✨ What Works Now

### **Automatic Transcription**
- ✅ Record audio → Stop recording
- ✅ App automatically transcribes with Whisper
- ✅ Shows "Processing..." alert
- ✅ Transcribed text appears in editor
- ✅ Word-level timestamps for sync

### **Real-Time Waveform**
- ✅ Red animated waveform while recording
- ✅ 40 bars that pulse with your voice
- ✅ Smooth animations
- ✅ Resets when you stop

### **AI Summaries**
- ✅ Generated when you eject cassette
- ✅ Uses GPT-4o-mini
- ✅ Under 50 words
- ✅ Captures key themes

---

## 💰 Cost Breakdown

### Per Recording
- **10-minute recording**: ~$0.06 total
  - Whisper transcription: $0.06
  - GPT summary: $0.0001

### Monthly Personal Use
- **30 recordings (5 mins each)**: ~$0.90/month
- Very affordable for family storytelling!

---

## 🧪 Testing

1. **Test Transcription**:
   - Record "Hello, this is a test"
   - Stop recording
   - Check console: should see `Transcribed: "Hello, this is a test"`

2. **Test Waveform**:
   - Press record button
   - Speak into mic
   - Watch red bars animate

3. **Test Summary**:
   - Record some audio
   - Press Eject button
   - Summary appears under cassette

---

## 🔧 Troubleshooting

### "Transcription unavailable"
- Check your OPENAI_API_KEY in .env
- Make sure you have API credits
- Check internet connection

### "Transcription pending - will process when online"
- ✅ Normal behavior when offline!
- Recording is saved locally
- Will transcribe automatically when back online
- Check blue banner for pending operations

### Waveform not animating
- It's simulated (expo-av limitation)
- Will still show animation when recording

### No audio recording
- Grant microphone permissions
- Test on real device (not simulator)

---

## 📵 Offline Mode

**Full offline support built-in!**

### What Happens Offline:
1. 📱 **Recording**: Works perfectly (no internet needed)
2. 📝 **Transcription**: Queued for later (shows "pending" placeholder)
3. 💾 **Saving**: Works locally
4. 🔄 **When back online**: Auto-syncs everything

### Visual Indicators:
- 🟠 **Orange bar**: "Offline - Changes will sync when back online"
- 🔵 **Blue bar**: "X pending operations - will process when online"
- ✅ **Alert**: "✓ Synced - All pending operations completed!"

### Testing Offline Mode:
1. Turn on Airplane Mode
2. Record audio → Stop
3. See "Transcription pending" in transcript
4. See blue banner showing 1 pending operation
5. Turn off Airplane Mode
6. App auto-syncs and shows "✓ Synced" alert
7. Transcription now shows real text

### Queue Details:
- Auto-retries failed requests 3 times
- Persists across app restarts
- Process in order recorded
- Works for transcriptions AND summaries

---

## 📝 Environment File

Your `.env` should look like:
```
OPENAI_API_KEY=sk-proj-abc123...your-actual-key
```

**Never commit `.env` to git!** (Already in .gitignore)

---

You're all set! 🚀

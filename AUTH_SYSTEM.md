# 🎯 ElderStories Authentication System

## What Was Implemented

### ✅ User Authentication
- **Firebase Auth**: Email/password sign-up and login
- **User Profiles**: Stored in Firestore with status tracking
- **Three user types**: Admin, Approved, Regular

### ✅ Admin Approval System
- **Admin Panel**: Approve/revoke users, monitor costs
- **Approval Workflow**: New users start as "PENDING"
- **Personal API Keys**: Non-approved users can add their own OpenAI key

### ✅ Cost Protection
- **$20/month cap**: Shared budget for approved users
- **Auto-disable**: Transcriptions stop when limit hit
- **Monthly reset**: Usage resets automatically
- **Per-user tracking**: See individual costs in Admin Panel

### ✅ Smart Transcription Access
- **Admin/Approved**: Use your shared OpenAI key (free for them)
- **Regular users**: Must add their own API key OR wait for approval
- **All users**: Can record, edit, and save cassettes without approval

---

## 🚀 How to Use

### For You (Admin):

1. **First Time Setup**:
   ```bash
   # Already done - Firebase and OpenAI configured in .env
   npm start
   ```

2. **Create Your Admin Account**:
   - Sign up in the app
   - Go to Firebase Console → Firestore Database
   - Find your user in `users` collection
   - Set `isAdmin: true`

3. **Invite Your Dad**:
   - Send him the app
   - He signs up with his email
   - You go to Admin Panel (👑 button)
   - Click "Approve" on his account
   - Now he gets free transcriptions!

4. **Monitor Costs**:
   - Click 👑 Admin button
   - See total monthly costs
   - See per-user usage
   - If hits $20, transcriptions auto-disable

### For Your Dad (Approved User):

1. **Sign Up**: Enter email and password
2. **Wait for approval**: You approve him
3. **Record**: Press record, speak, stop
4. **Auto-transcribe**: Happens automatically
5. **No costs**: Uses your shared API key

### For Other Users (Not Approved):

1. **Sign Up**: Create account
2. **Record**: Works immediately
3. **Transcription**: Two options:
   - Wait for admin approval, OR
   - Add personal OpenAI API key in Settings ⚙️

---

## 🔒 Security

- ✅ Firebase handles password encryption
- ✅ Users can only edit their own profiles  
- ✅ Admins can approve anyone
- ✅ Firestore rules prevent unauthorized access
- ✅ API keys in `.env` (never in Git)

---

## 💰 Cost Breakdown

### Current Setup (Recommended for Your Dad):
- **You pay**: ~$0.06 per 10-min recording
- **Monthly cap**: $20 (about 333 10-min recordings)
- **When limit hit**: Transcriptions pause until next month
- **Recording still works**: Just no transcription

### Example Monthly Costs:
| Recordings | Cost |
|-----------|------|
| 10 × 10min | $0.60 |
| 50 × 10min | $3.00 |
| 100 × 10min | $6.00 |
| 333 × 10min | $20.00 (limit) |

---

## 📱 UI Features

### Login Screen:
- Sign up / Sign in toggle
- Clear messaging about approval process
- "Free recordings for all" indicator

### Settings Screen (⚙️):
- Account info with status badge
- Monthly usage stats (for approved users)
- Personal API key field (for non-approved users)
- Sign out button

### Admin Panel (👑):
- List all users with status
- Approve/revoke buttons
- Make admin button
- Total cost tracking
- Monthly usage per user

### Main Screen:
- Floating ⚙️ button (Settings)
- Floating 👑 button (Admin - only for admins)
- Network status banners
- Pending operations counter

---

## 🎯 Typical Workflow

### Day 1:
1. You setup Firebase and OpenAI (one-time)
2. You sign up → Make yourself admin in Firestore
3. Dad signs up → You approve him in Admin Panel
4. Dad records stories → Auto-transcribes for free

### Ongoing:
- Dad records whenever he wants
- Transcriptions happen automatically
- You monitor costs in Admin Panel
- If approaching $20, you can:
  - Wait for monthly reset
  - Increase budget (change code)
  - Ask dad to add his own API key

---

## 🔧 Configuration

### Change Monthly Limit:
Edit `src/services/AuthService.ts`:
```typescript
const MONTHLY_COST_LIMIT = 20; // Change to 50, 100, etc.
```

### Make Someone Admin:
1. Firebase Console → Firestore
2. Find user in `users` collection
3. Edit document → Add field `isAdmin: true`

### Remove Approval Requirement:
If you want everyone to have free access:
Edit `src/services/AuthService.ts`:
```typescript
canUseSharedApiKey(): boolean {
  return true; // Everyone gets free transcriptions
}
```

---

## 📚 Documentation

- **FIREBASE_SETUP.md**: Step-by-step Firebase setup
- **QUICKSTART.md**: OpenAI setup + testing
- **README.md**: Full project overview
- **PROJECT_SUMMARY.md**: Technical architecture

---

## ✨ What Works Without Internet

- ✅ Recording audio
- ✅ Playing cassettes
- ✅ Timeline editing
- ✅ Saving cassettes
- ⏳ Transcription (queued, processes when online)
- ⏳ Summaries (queued, processes when online)

---

## 🎁 Ready to Use!

The app is now fully functional:
1. Authentication ✅
2. Admin approval ✅
3. Cost tracking ✅
4. Offline support ✅
5. Admin panel ✅
6. User settings ✅

Just follow FIREBASE_SETUP.md to configure Firebase and you're ready to go!

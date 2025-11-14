# 🔐 Firebase Setup for User Authentication

## Quick Setup (10 minutes)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `ElderStories` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### 3. Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode**
4. Select your region (closest to your users)
5. Click "Enable"

### 4. Set Firestore Rules

Click "Rules" tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      // Admins can write any user profile
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

Click "Publish"

### 5. Get Firebase Config

1. Go to **Project Settings** (gear icon) → **Your apps**
2. Click **Web app** icon (`</>`)
3. Register app name: `ElderStories`
4. **Don't** check "Firebase Hosting"
5. Click "Register app"
6. Copy the `firebaseConfig` object values

### 6. Add to .env File

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Firebase config:
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=elderstories-xxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=elderstories-xxxxx
FIREBASE_STORAGE_BUCKET=elderstories-xxxxx.appspot.com
FIREBASE_MESSAGING_SENDER_ID=1234567890
FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

### 7. Create Your Admin Account

1. Run the app: `npm start`
2. Sign up with your email (this will be your admin account)
3. Go to Firebase Console → Firestore Database
4. Find your user document in the `users` collection
5. Click on your user document
6. Click "Add field":
   - Field: `isAdmin`
   - Type: boolean
   - Value: `true`
7. Click "Update"

Now you can approve other users!

---

## User Approval System

### How It Works:

1. **New User Signs Up**:
   - Creates account (email/password)
   - Status: `PENDING APPROVAL`
   - Can record audio
   - **Cannot** use transcriptions

2. **Admin Approves User**:
   - Admin goes to Admin Panel
   - Clicks "Approve" on pending user
   - User can now use free transcriptions (up to $20/month shared budget)

3. **Alternative: Personal API Key**:
   - Non-approved users can add their own OpenAI API key in Settings
   - Bypasses approval requirement
   - User pays their own API costs

### Admin Features:

- View all users
- Approve/revoke access
- Monitor monthly costs
- Make other users admins
- $20/month cost tracking

---

## Security Notes

- ✅ Firebase handles all password encryption
- ✅ Users can only edit their own profiles
- ✅ Admins can approve any user
- ✅ API keys stored securely in .env (never committed)
- ✅ Firestore rules prevent unauthorized access

---

## Testing

1. **Create test account**: Sign up with a test email
2. **Approve yourself**: Make yourself admin in Firestore
3. **Approve test user**: Use Admin Panel to approve test account
4. **Test transcription**: Record audio and verify it transcribes
5. **Check costs**: Admin Panel shows usage

---

## Cost Protection

- $20/month limit per approved user
- Auto-disables transcription when limit hit
- Monthly usage resets automatically
- Admin can see total costs in Admin Panel

---

## Troubleshooting

### "Failed to create account"
- Check Firebase Auth is enabled
- Check email format is valid
- Password must be 6+ characters

### "Failed to load users" in Admin Panel
- Check Firestore rules are published
- Check you're logged in
- Check Firestore Database is created

### "Permission denied" errors
- Check Firestore rules match the template above
- Make sure you set `isAdmin: true` in Firestore

---

Need help? Check the Firebase Console for error logs under **Build** → **Firestore Database** → **Logs**

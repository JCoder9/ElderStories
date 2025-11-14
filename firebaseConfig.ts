import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

// Get Firebase config from expo-constants (loaded from .env via app.config.js)
const firebaseConfig = {
  apiKey:
    Constants.expoConfig?.extra?.firebaseApiKey || "AIzaSyCsGvQbKRG-u6EjjOiB1datNYe9eg6FvwE",
  authDomain:
    Constants.expoConfig?.extra?.firebaseAuthDomain || "stories-3b06f.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "stories-3b06f",
  storageBucket:
    Constants.expoConfig?.extra?.firebaseStorageBucket || "stories-3b06f.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "290669883020",
  appId:
    Constants.expoConfig?.extra?.firebaseAppId || "1:290669883020:web:ad71a373f44111ce7e55a9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;

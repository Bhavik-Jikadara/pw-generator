// firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';

// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Add this line to export the ENCRYPTION_KEY
export const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY; // Ensure this environment variable is set

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Initialize Firestore with persistent cache
let db;
try {
  db = initializeFirestore(app, {
    cache: persistentLocalCache({
      tabManager: persistentSingleTabManager()
    })
  });
} catch (error) {
  db = getFirestore(app);
}

export { auth, db };
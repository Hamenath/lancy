import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAks8SqZi8Jc6AhlxqeHGafTxkQ7-lS8kU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lancy-ada21.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lancy-ada21",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lancy-ada21.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1008551935745",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1008551935745:web:d1142193d95e647f5aa500",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BDMSNHVQLD"
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Firebase Analytics safely when supported
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics not supported in this environment:", err);
  });
}

export { app, auth, db, analytics, firebaseConfig };
export default app;

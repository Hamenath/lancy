import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


// Check if keys are defined and not placeholders
const hasFirebaseKeys = firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined" && firebaseConfig.apiKey.length > 5;

let app: any;
let auth: any;
let db: any;

if (hasFirebaseKeys) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    setupMock();
  }
} else {
  console.warn("Firebase environment variables are missing. App is running in mock/offline mode.");
  setupMock();
}

function setupMock() {
  auth = {
    onAuthStateChanged: (callback: any) => {
      // Mock user is logged out initially
      callback(null);
      return () => {};
    },
    currentUser: null,
  } as any;
  db = {} as any;
}

export { auth, db };
export default app;


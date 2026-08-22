import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAI, getGenerativeModel, GenerativeModel } from "firebase/ai";
import { getAuth } from "firebase/auth";

// Web app's Firebase configuration loaded securely from environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skillpilot-a1514.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillpilot-a1514",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skillpilot-a1514.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "269590209455",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:269590209455:web:bdf435915eb03975ae455a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X3ZQ7S9JG5"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (Browser Only)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn("Firebase Analytics initialization warning:", err);
  }
}

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase AI (Gemini 1.5 Flash)
let aiModel: GenerativeModel | null = null;

try {
  const ai = getAI(app);
  aiModel = getGenerativeModel(ai, { model: "gemini-1.5-flash" });
} catch (err) {
  console.warn("Firebase AI SDK initialization warning, using direct API fallback:", err);
}

export { analytics, aiModel };

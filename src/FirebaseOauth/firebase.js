// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Use a single Firebase configuration for both providers
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
auth.languageCode = 'en';

// Initialize Providers with custom parameters optimized for hosting
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Remove ux_mode to let Firebase handle popup vs redirect automatically
});

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  allow_signup: 'true'
});

// Export single auth instance and providers
export { 
  auth,
  googleProvider, 
  githubProvider 
};
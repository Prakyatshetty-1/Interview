// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Use a single Firebase configuration for both providers
const firebaseConfig = {
  apiKey: "AIzaSyC10qep9vmD6V9GHv0TJZvPjeCL9iwfVyk",
  authDomain: "interviewapp-c2082.firebaseapp.com",
  projectId: "interviewapp-c2082",
  storageBucket: "interviewapp-c2082.firebasestorage.app",
  messagingSenderId: "368524080705",
  appId: "1:368524080705:web:19b137744f56924b0e78c0"
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
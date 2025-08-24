// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Fixed import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC10qep9vmD6V9GHv0TJZvPjeCL9iwfVyk",
  authDomain: "interviewapp-c2082.firebaseapp.com",
  projectId: "interviewapp-c2082",
  storageBucket: "interviewapp-c2082.firebasestorage.app",
  messagingSenderId: "368524080705",
  appId: "1:368524080705:web:19b137744f56924b0e78c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

// Export the auth and provider so they can be imported in other files
export { auth, provider };
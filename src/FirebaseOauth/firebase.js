// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Configuration for Google Auth
const googleConfig = {
  apiKey: "AIzaSyC10qep9vmD6V9GHv0TJZvPjeCL9iwfVyk",
  authDomain: "interviewapp-c2082.firebaseapp.com",
  projectId: "interviewapp-c2082",
  storageBucket: "interviewapp-c2082.firebasestorage.app",
  messagingSenderId: "368524080705",
  appId: "1:368524080705:web:19b137744f56924b0e78c0"
};

// Configuration for GitHub Auth
const githubConfig = {
  apiKey: "AIzaSyDHdoUW6lww2jN2cGEyyX2mo5FBmmf8gKo",
  authDomain: "interview-e832a.firebaseapp.com",
  projectId: "interview-e832a",
  storageBucket: "interview-e832a.firebasestorage.app",
  messagingSenderId: "479078743626",
  appId: "1:479078743626:web:05d987f8392c939235f0b3"
};

// Initialize Firebase apps with named instances
const googleApp = initializeApp(googleConfig, 'googleApp');
const githubApp = initializeApp(githubConfig, 'githubApp');

// Initialize Auth for each app
const googleAuth = getAuth(googleApp);
googleAuth.languageCode = 'en';

const githubAuth = getAuth(githubApp);
githubAuth.languageCode = 'en';

// Initialize Providers with custom parameters to avoid COOP issues
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  ux_mode: 'popup'
});

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  allow_signup: 'true'
});

// Export everything
export { 
  googleAuth, 
  githubAuth, 
  googleProvider, 
  githubProvider 
};
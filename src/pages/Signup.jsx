import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import './Signup.css';
import SignupImage from "../assets/Image3.png";
import { Link } from 'react-router-dom';

// Import Firebase auth functions and configurations from unified file
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider, 
  GithubAuthProvider 
} from "firebase/auth";
import { 
  auth,
  googleProvider, 
  githubProvider 
} from '../FirebaseOauth/firebase.js';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    description: '',
    type: 'success'
  });
  const navigate = useNavigate();

  // Check for redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Redirect result received:", result);
          await processAuthResult(result);
        }
      } catch (error) {
        console.error("Redirect result error:", error);
        handleAuthError(error);
      }
    };

    handleRedirectResult();
  }, []);

  const showToast = (message, description, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      description,
      type
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (response.ok) {
        // Store the token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        console.log("Form submitted successfully");
        showToast('Account Created!', 'Welcome to Askora!', 'success');
        setTimeout(() => navigate("/Preference"), 2000);
      } else {
        console.error("Form submission failed:", data.message);
        showToast('Signup Failed', data.message || "Signup failed. Try again.", 'error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Connection Error', "Something went wrong. Please try again later.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Unified function to process auth results
  const processAuthResult = async (result, provider = 'unknown') => {
    try {
      const user = result.user;
      console.log(`${provider} Sign-In successful:`, user);
      
      // Prepare user data to send to backend
      const userData = {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL
      };
      
      const endpoint = provider === 'Google' ? '/google-signup' : '/github-signup';
      console.log(`Sending user data to backend for ${provider} signup:`, userData);
      
      // Send user data to your backend for SIGNUP
      const response = await fetch(`${import.meta.env.VITE_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log(`${provider} signup response:`, data);
      
      if (response.ok) {
        // Store the token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        showToast('Account Created!', 'Welcome to Askora! Please set your preferences.', 'success');
        
        // Navigate to preferences page after signup
        setTimeout(() => {
          navigate('/Preference');
        }, 2000);
        
      } else {
        console.error("Failed to create user account:", data.message);
        
        // Handle specific error cases
        if (response.status === 400 && data.code === 'USER_EXISTS') {
          showToast(
            'Account Already Exists', 
            `An account with this ${provider} account already exists. Please use Sign In instead.`, 
            'error'
          );
        } else if (response.status === 400 && data.code === 'EMAIL_EXISTS') {
          showToast(
            'Email Already Registered', 
            'This email is already registered. Please use your existing login method.', 
            'error'
          );
        } else {
          showToast(
            'Signup Failed', 
            data.message || `${provider} sign-up failed`, 
            'error'
          );
        }
        
        // Sign out to prevent confusion
        await auth.signOut();
      }
      
    } catch (error) {
      console.error(`Error processing ${provider} auth result:`, error);
      showToast('Signup Failed', `${provider} sign-up failed`, 'error');
      await auth.signOut();
    }
  };

  // Unified error handler
  const handleAuthError = (error) => {
    console.error("Authentication error:", error);
    const errorCode = error.code;
    const errorMessage = error.message;
    
    // Handle specific Firebase error cases
    if (errorCode === 'auth/popup-closed-by-user') {
      showToast('Sign-up Cancelled', 'Sign-up was cancelled', 'error');
    } else if (errorCode === 'auth/popup-blocked') {
      showToast('Popup Blocked', 'Please allow popups for this site and try again', 'error');
    } else if (errorCode === 'auth/network-request-failed') {
      showToast('Network Error', 'Please check your internet connection', 'error');
    } else if (errorCode === 'auth/account-exists-with-different-credential') {
      showToast('Account Exists', 'An account with this email already exists with a different sign-in method', 'error');
    } else {
      showToast('Sign-up Failed', errorMessage, 'error');
    }
  };

  // Detect if device is mobile or if popup might be blocked
  const shouldUseRedirect = () => {
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for browsers that commonly block popups (like Safari in private mode)
    const isPrivateMode = window.navigator.userAgent.includes('Safari') && 
                          !window.navigator.userAgent.includes('Chrome');
    
    return isMobile || isPrivateMode;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
      
    try {
      console.log("Starting Google Sign-Up...");
      
      if (shouldUseRedirect()) {
        // Use redirect for mobile devices or when popups might be blocked
        console.log("Using redirect flow for Google");
        await signInWithRedirect(googleAuth, googleProvider);
        // The result will be handled in the useEffect hook when the page reloads
      } else {
        // Try popup first, fallback to redirect if it fails
        console.log("Attempting popup flow for Google");
        try {
          const result = await signInWithPopup(googleAuth, googleProvider);
          await processAuthResult(result, 'Google');
        } catch (popupError) {
          if (popupError.code === 'auth/popup-blocked' || 
              popupError.code === 'auth/popup-closed-by-user') {
            console.log("Popup blocked, falling back to redirect");
            await signInWithRedirect(googleAuth, googleProvider);
            return; // Exit early as redirect will handle the flow
          }
          throw popupError; // Re-throw other errors
        }
      }
      
    } catch (error) {
      handleAuthError(error);
      
      // Ensure user is signed out on error
      try {
        await googleAuth.signOut();
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
    } finally {
      if (!shouldUseRedirect()) {
        setIsLoading(false);
      }
      // For redirect, loading state will be reset on page reload
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    
    try {
      console.log("Starting GitHub Sign-Up...");
      
      if (shouldUseRedirect()) {
        // Use redirect for mobile devices or when popups might be blocked
        console.log("Using redirect flow for GitHub");
        await signInWithRedirect(githubAuth, githubProvider);
        // The result will be handled in the useEffect hook when the page reloads
      } else {
        // Try popup first, fallback to redirect if it fails
        console.log("Attempting popup flow for GitHub");
        try {
          const result = await signInWithPopup(githubAuth, githubProvider);
          await processAuthResult(result, 'GitHub');
        } catch (popupError) {
          if (popupError.code === 'auth/popup-blocked' || 
              popupError.code === 'auth/popup-closed-by-user') {
            console.log("Popup blocked, falling back to redirect");
            await signInWithRedirect(githubAuth, githubProvider);
            return; // Exit early as redirect will handle the flow
          }
          throw popupError; // Re-throw other errors
        }
      }
      
    } catch (error) {
      handleAuthError(error);
      
      // Ensure user is signed out on error
      try {
        await githubAuth.signOut();
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
    } finally {
      if (!shouldUseRedirect()) {
        setIsLoading(false);
      }
      // For redirect, loading state will be reset on page reload
    }
  };

  return (
    <div className="signup-container">
      {/* Toast Component - You'll need to create this similar to Login.jsx */}
      {toast.isVisible && (
        <div className="toast-container">
          <div className="toast-wrapper">
            <div className={`toast-alert ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
              <div className="toast-content">
                <div className="toast-text">
                  <p className="toast-title">{toast.message}</p>
                  <p className="toast-description">{toast.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Left Panel - Form */}
      <div className="left-panel">
        <div className="form-container">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo">Askora</div>
            <div className="logo-accent"></div>
          </div>

          {/* Form Header */}
          <div className="form-header">
            <h1 className="title1">Create an account</h1>
            <p className="subtitle1">Start your 30 day free trial, cancel anytime</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label className="label">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter Your Name"
                className={`input ${focusedField === "name" ? "input-focused" : ""}`}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label className="label">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter Your Email"
                className={`input input-active ${focusedField === "email" ? "input-focused" : ""}`}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label className="label">Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="Create a Password"
                className={`input ${focusedField === "password" ? "input-focused" : ""}`}
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="create-button1" disabled={isLoading}>
              <span>{isLoading ? 'Creating Account...' : 'Create an account'}</span>
              <div className="button-glow1"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="divider1">
            <div className="divider-line1"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line1"></div>
          </div>

          {/* Google Sign In */}
          <button 
            onClick={handleGoogleSignIn} 
            type="button" 
            className="google-button"
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" className="google-icon">
              <path
                fill="#4285F4"
                d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
              />
              <path
                fill="#34A853"
                d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75 4.8 4.8 0 0 1-4.52-3.36H1.83v2.07A8 8 0 0 0 8.98 17z"
              />
              <path
                fill="#FBBC05"
                d="M4.46 10.41a4.8 4.8 0 0 1-.25-1.41c0-.49.09-.97.25-1.41V5.52H1.83a8 8 0 0 0 0 7.17l2.63-2.28z"
              />
              <path
                fill="#EA4335"
                d="M8.98 4.23c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.15 4.52l2.63 2.28c.61-1.85 2.35-3.57 4.52-3.57z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          
          {/* GitHub Sign In */}
          <button 
            onClick={handleGitHubSignIn} 
            className="google-button" 
            style={{ marginTop: '0.75rem' }}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </button>

          {/* Sign In Link */}
          <div className="sign-in-link">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Sign In
            </Link>
          </div>

          {/* Footer */}
          <div className="footer1">© 2024 figr. All rights reserved.</div>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>
      </div>

      {/* Right Panel - Background Image */}
      <div className="right-panel">
        <div className="overlay">
          <img
            src={SignupImage}
            alt="Background"
            className="background-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
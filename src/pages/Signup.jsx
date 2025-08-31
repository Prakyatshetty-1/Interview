import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import './Signup.css';
import SignupImage from "../assets/Image3.png";
import { Link } from 'react-router-dom';

// Import Firebase auth functions and configurations from unified file
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { 
  googleAuth, 
  githubAuth, 
  googleProvider, 
  githubProvider 
} from '../FirebaseOauth/firebase.js'; // Updated import from unified file

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
      const response = await fetch('http://localhost:5000/signup', {
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
        alert("Signup successful!");
        navigate("/Preference");
      } else {
        console.error("Form submission failed:", data.message);
        alert(data.message || "Signup failed. Try again.");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
      
  try {
    console.log("Starting Google Sign-Up...");
    const result = await signInWithPopup(googleAuth, googleProvider); // Use googleAuth and googleProvider
    
    // This gives you a Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    
    console.log("Google Sign-In successful:", user);
    
    // Prepare user data to send to backend
    const userData = {
      name: user.displayName,
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL
    };
    
    console.log("Sending user data to backend for signup:", userData);
    
    // Send Google user data to your backend for SIGNUP
    const response = await fetch('http://localhost:5000/google-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    console.log('Google signup response:', data);
    
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
          'An account with this Google account already exists. Please use Sign In instead.', 
          'error'
        );
      } else if (response.status === 400 && data.code === 'EMAIL_EXISTS') {
        showToast(
          'Email Already Registered', 
          'This email is already registered with password. Please use email/password login.', 
          'error'
        );
      } else {
        showToast(
          'Signup Failed', 
          data.message || 'Google sign-up failed', 
          'error'
        );
      }
      
      // Sign out from Google to prevent confusion
      await googleAuth.signOut();
    }
    
  } catch (error) {
    console.error("Google Sign-Up error:", error);
    const errorCode = error.code;
    const errorMessage = error.message;
    
    // Handle specific Firebase error cases
    if (errorCode === 'auth/popup-closed-by-user') {
      showToast('Sign-up Cancelled', 'Google sign-up was cancelled', 'error');
    } else if (errorCode === 'auth/popup-blocked') {
      showToast('Popup Blocked', 'Please allow popups for this site and try again', 'error');
    } else if (errorCode === 'auth/network-request-failed') {
      showToast('Network Error', 'Please check your internet connection', 'error');
    } else {
      showToast('Sign-up Failed', 'Google Sign-Up failed: ' + errorMessage, 'error');
    }
    
    // Ensure user is signed out from Google on error
    try {
      await googleAuth.signOut();
    } catch (signOutError) {
      console.error("Error signing out:", signOutError);
    }
  } finally {
    setIsLoading(false);
  }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    
    try {
      console.log("Starting GitHub Sign-Up...");
      const result = await signInWithPopup(githubAuth, githubProvider); // Use githubAuth and githubProvider
      
      // This gives you a GitHub Access Token
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      
      console.log("GitHub Sign-In successful:", user);
      
      // Prepare user data to send to backend
      const userData = {
        name: user.displayName || user.email.split('@')[0], // Use email prefix if displayName is null
        email: user.email,
        uid: user.uid,
        photoURL: user.photoURL
      };
      
      console.log("Sending user data to backend for GitHub signup:", userData);
      
      // Send GitHub user data to your backend for SIGNUP
      const response = await fetch('http://localhost:5000/github-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('GitHub signup response:', data);
      
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
            'An account with this GitHub account already exists. Please use Sign In instead.', 
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
            data.message || 'GitHub sign-up failed', 
            'error'
          );
        }
        
        // Sign out from GitHub to prevent confusion
        await githubAuth.signOut();
      }
      
    } catch (error) {
      console.error("GitHub Sign-Up error:", error);
      const errorCode = error.code;
      const errorMessage = error.message;
      
      // Handle specific Firebase error cases
      if (errorCode === 'auth/popup-closed-by-user') {
        showToast('Sign-up Cancelled', 'GitHub sign-up was cancelled', 'error');
      } else if (errorCode === 'auth/popup-blocked') {
        showToast('Popup Blocked', 'Please allow popups for this site and try again', 'error');
      } else if (errorCode === 'auth/network-request-failed') {
        showToast('Network Error', 'Please check your internet connection', 'error');
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        showToast('Account Exists', 'An account with this email already exists with a different sign-in method', 'error');
      } else {
        showToast('Sign-up Failed', 'GitHub Sign-Up failed: ' + errorMessage, 'error');
      }
      
      // Ensure user is signed out from GitHub on error
      try {
        await githubAuth.signOut();
      } catch (signOutError) {
        console.error("Error signing out:", signOutError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Toast would go here - you need to implement the Toast component similar to Login.jsx */}
      
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
import React, { useState, useEffect } from 'react';
import './Login.css';

import LoginImage from "../assets/Image3.png";
import { Link, useNavigate } from 'react-router-dom';

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, provider } from '../FirebaseOauth/firebase.js'; // Adjust path if needed

// Custom Toast Component
const Toast = ({ message, description, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto close after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    if (type === 'success') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="toast-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="toast-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      );
    }
  };

  return (
    <div className="toast-container">
      <div className="toast-wrapper">
        <div className={`toast-alert ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-content">
            <div className={`toast-icon-container ${type === 'success' ? 'toast-icon-success' : 'toast-icon-error'}`}>
              {getIcon()}
            </div>
            <div className="toast-text">
              <p className="toast-title">{message}</p>
              <p className="toast-description">{description}</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const Login = () => {
const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [focusedField, setFocusedField] = useState(null);
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

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
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
    
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful');
        localStorage.setItem("token", data.token);
        showToast('Login Successful!', 'Welcome back to Askora', 'success');
        
        // Check if user has filled preferences
        try {
          const prefResponse = await fetch("http://localhost:5000/api/preference/check", {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          });

          const prefData = await prefResponse.json();

          // Navigate after showing toast
          setTimeout(() => {
            if (prefResponse.ok && prefData.alreadySubmitted) {
              navigate('/dashboard');
            } else {
              navigate('/Preference');
            }
          }, 2000);
        } catch (err) {
          console.error("Error checking preferences", err);
          setTimeout(() => navigate('/Preference'), 2000);
        }

      } else {
        showToast('Login Failed', data.message || 'Invalid credentials', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Connection Error', 'Something went wrong during login', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
        
        try {
          console.log("Starting Google Sign-In...");
          const result = await signInWithPopup(auth, provider);
          
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
          
          console.log("Sending user data to backend:", userData);
          
          // Send Google user data to your backend
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
            
            alert("Google Sign-In successful!");
            navigate("/Preference");
          } else {
            console.error("Failed to register user on backend:", data.message);
            alert(data.message || "Sign-in successful but failed to complete registration");
          }
          
        } catch (error) {
          console.error("Google Sign-In error:", error);
          const errorCode = error.code;
          const errorMessage = error.message;
          
          // Handle specific error cases
          if (errorCode === 'auth/popup-closed-by-user') {
            alert("Sign-in was cancelled");
          } else if (errorCode === 'auth/popup-blocked') {
            alert("Popup was blocked by browser. Please allow popups for this site.");
          } else if (errorCode === 'auth/network-request-failed') {
            alert("Network error. Please check your internet connection.");
          } else {
            alert("Google Sign-In failed: " + errorMessage);
          }
        } finally {
          setIsLoading(false);
        }
  };

  const handleGitHubSignIn = () => {
    console.log("GitHub sign in clicked");
    showToast('Coming Soon', 'GitHub Sign-In will be available soon', 'success');
  };

  const handleLinkedInSignIn = () => {
    console.log("LinkedIn sign in clicked");
    showToast('Coming Soon', 'LinkedIn Sign-In will be available soon', 'success');
  };

  return (
    <>
      <Toast
        message={toast.message}
        description={toast.description}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div className="login-container">
        {/* Left Panel - Background Image */}
        <div className="left-panel-image">
          <div className="overlay-image">
            <img 
              src={LoginImage} 
              alt="Login Background" 
              className="background-image"
            />
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="right-panel-form">
          <div className="form-container">
            {/* Logo */}
            <div className="logo-container">
              <div className="logo">Askora</div>
              <div className="logo-accent"></div>
            </div>

            {/* Form Header */}
            <div className="form-header">
              <h1 className="title1">Welcome back</h1>
              <p className="subtitle1">Sign in to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="form">
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
                  placeholder="Enter Your Password"
                  className={`input ${focusedField === "password" ? "input-focused" : ""}`}
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="forgot-password">
                <a href="#" className="link">
                  Forgot your password?
                </a>
              </div>

              <button type="submit" className="create-button1">
                <span>Sign in</span>
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
            <button onClick={handleGoogleSignIn} className="google-button">
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
              Sign in with Google
            </button>

            {/* GitHub Sign In */}
            <button onClick={handleGitHubSignIn} className="google-button" style={{ marginTop: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign in with GitHub
            </button>

            {/* LinkedIn Sign In */}
            <button onClick={handleLinkedInSignIn} className="google-button" style={{ marginTop: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Sign in with LinkedIn
            </button>

            {/* Sign Up Link */}
            <div className="sign-up-link">
              Don't have an account?{" "}
              <Link to="/signup" className="link">
                Sign Up
              </Link>
            </div>

            {/* Footer */}
            <div className="footer1">© 2024 figr. All rights reserved.</div>
          </div>

          {/* Decorative Elements */}
          <div className="decorative-circle-1"></div>
          <div className="decorative-circle-2"></div>
        </div>
      </div>
    </>
  );
};

export default Login;
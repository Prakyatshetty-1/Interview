import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'

import './Signup.css';
import SignupImage from "../assets/Image3.png";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    navigate("/Preference");
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in clicked");
  };

  return (
    <div className="signup-container">
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
              />
            </div>

            <button type="submit" className="create-button1">
              <span>Create an account</span>
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

          {/* Sign In Link */}
          <div className="sign-in-link">
            Already have an account?{" "}
            <a href="#" className="link">
              Sign In
            </a>
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
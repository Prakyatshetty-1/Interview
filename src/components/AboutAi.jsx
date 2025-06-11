import React from 'react';
import './AboutAi.css';

const AboutAi = () => {
  return (
    <div className="about-ai-container">
      <div className="about-ai-background-glow"></div>
      <div className="about-ai-wrapper">
        <div className="about-ai-layout">
          {/* Spline 3D Model Container */}
          <iframe 
            src='https://my.spline.design/aivoiceassistant80s-rJHjVGLWDu19aZ0Cu5PiVFX2/'
            frameBorder='0' 
            width='100%' 
            height='100%'
          />
         
          {/* Content Section */}
          <div className="about-ai-content-section">
            {/* Main Title */}
            <h1 className="about-ai-main-title">
              MASTER THROUGH
              <br />
              ASKORA AI
            </h1>
                         
            {/* Description */}
            <p className="about-ai-main-description">
              Experience AI-driven learning simulations with advanced machine learning algorithms
              <br />
              and intelligent tutoring systems designed for optimal knowledge acquisition.
              <br />
              Practice smart. Learn better.
            </p>
             
            {/* Features Section */}
            <div className="about-ai-features-section">
              <div className="about-ai-features-text">
                Machine Learning • Deep Learning • Neural Networks • Computer Vision • Natural Language Processing
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidespline"></div>
    </div>
  );
};

export default AboutAi;
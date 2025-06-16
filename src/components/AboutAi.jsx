import React from 'react';
import './AboutAi.css';

const AboutAi = () => {
  return (
    <div className="about-ai-container">
      {/* Enhanced background orbs for consistency */}
      
      
      <div className="about-ai-wrapper">
        <div className="about-ai-layout">
          {/* Spline 3D Model Container */}
          <iframe 
            src='https://my.spline.design/voiceinteractionanimation-2TyeWSP24w6QzdGddVpF30we/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            title="Askora Voice Interaction Animation"
          ></iframe>
          
          {/* Content Section */}
          <div className="about-ai-content-section">
            {/* Main Title */}
            <h1 className="about-ai-main-title">
              INTRODUCING 
              <br />
              ASKORA
            </h1>
                         
            {/* Description */}
            <p className="about-ai-main-description">
              Experience realistic mock interviews with an intelligent voice bot that speaks, listens, and responds — just like a real interviewer.
              <br/>
              <br/>
              Askora creates a high-pressure, real-world interview atmosphere using advanced speech synthesis, natural language understanding,
              and context-aware questioning.
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
      
      {/* Hide spline overflow */}
      <div className="hidespline"></div>
    </div>
  );
};

export default AboutAi;
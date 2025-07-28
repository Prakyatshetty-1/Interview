import React, { useState } from 'react';
import './SavePage.css';

const WaveAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStart = () => setIsAnimating(true);
  const handleStop = () => setIsAnimating(false);

  return (
    <div className="wave-wrapper">
      <div className="button-group">
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
      </div>

      <div className="wave-container">
        <div className="circle"></div>

        {isAnimating && (
          <>
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default WaveAnimation;

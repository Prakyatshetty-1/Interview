
import React from 'react';
import "./Card.css";

const Card = ({ difficulty = "Med.", title = "Full Stack Challenge", creator = "bhavith", tags = ["Web Dev", "Full Stack"],path="/FullStackWebDev.png" }) => {
  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'med':
      case 'medium':
        return 'difficulty-med';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-med';
    }
  };

  return (
    <>
    

    <div className="challenge-card" style={ { backgroundImage: `url(${path})` }}>
        <div className="gradient-overlay"></div>
        <div className="bottom-blur"></div>
        
        <div className="card-content1">
          {/* Top section with dots and difficulty */}
          <div className="top-section1">
            
            <div className={`difficulty-badge ${getDifficultyClass(difficulty)}`}>
              {difficulty}
            </div>
          </div>

          {/* Bottom section */}
          <div className="bottom-section1">
            <div>
              <h2 className="title134">{title}</h2>
              <p className="creator">Created by {creator}</p>
            </div>
            
            {/* Tags */}
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            
            {/* Start button */}
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Card;
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import "./SaveCard.css";

export default function SaveCard(props) {
  const [popupMessage, setPopupMessage] = useState("");
  const [isClicked, setIsClicked] = useState(false);

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  // Determine if this is a card or folder type based on props
  const isFolder = props.type === 'folder' || props.numberOfPacks;
  const cardType = isFolder ? 'folder-type' : 'card-type';

  // Handle difficulty styling for cards
  const getDifficultyClass = (difficulty) => {
    if (!difficulty) return "";
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "difficulty-easy";
      case "med":
      case "medium":
        return "difficulty-med";
      case "hard":
        return "difficulty-hard";
      default:
        return "difficulty-med";
    }
  };

  const handleUnsave = async (e) => {
    e.stopPropagation(); // Prevent any parent click events
    
    // Trigger click animation
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);

    if (!props.id) {
      showPopup("❌ Missing card ID.");
      return;
    }

    console.log("Unsaving card with ID:", props.id);

    try {
      const response = await fetch(`http://localhost:5000/api/saved/${props.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Unsave successful:", data);
        showPopup("🗑️ Removed from saved!");
        
        // Refresh the entire page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000); // 1 second delay to show the success message
      } else {
        console.error("Unsave failed:", data);
        showPopup("❌ Failed to remove card.");
      }
    } catch (error) {
      console.error("Network error:", error);
      showPopup("⚠️ Error removing card.");
    }
  };

  const handleCardClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <>
      <div
        className={`saved-card-background ${cardType}`}
        style={{
          backgroundImage: isFolder 
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${props.path})`
            : `url(${props.path})`
        }}
        onClick={handleCardClick}
      >
        {/* Hover Unsave Button */}
        <div className="saved-hover-save-container">
          <button
            className={`saved-hover-save-button ${isClicked ? 'clicked' : ''}`}
            onClick={handleUnsave}
            title="Remove from saved"
          >
            <div className="saved-icon">
              <LuTrash2 size={20} />
            </div>
          </button>
        </div>

        <div className="saved-card-content">
          {/* Top section - only for cards */}
          {!isFolder && (
            <div className="saved-top-section">
              {props.difficulty && (
                <div className={`saved-difficulty-badge ${getDifficultyClass(props.difficulty)}`}>
                  {props.difficulty}
                </div>
              )}
            </div>
          )}

          {/* Bottom section */}
          <div className="saved-bottom-section">
            <div>
              <h2 className="saved-card-title">{props.title}</h2>
              {!isFolder && props.creator && (
                <p className="saved-card-creator">Created by {props.creator}</p>
              )}
              {isFolder && (
                <p className="saved-card-meta">{props.numberOfPacks || "145"} Packs</p>
              )}
            </div>

            {/* Tags for cards */}
            {!isFolder && props.tags && props.tags.length > 0 && (
              <div className="saved-tags-container">
                {props.tags.map((tag, index) => (
                  <span key={index} className="saved-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Profile avatars for folders */}
            {isFolder && (
              <div className="saved-profile-avatars">
                {[...Array(5)].map((_, index) => (
                  <div className="saved-avatar-container" key={index}>
                    <img
                      src="/placeholder.svg?height=27&width=27"
                      alt={`Profile ${index + 1}`}
                      className="saved-avatar"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup message */}
      {popupMessage && <div className="popup-message">{popupMessage}</div>}
    </>
  );
}
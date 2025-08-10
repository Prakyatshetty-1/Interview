import { useState, useEffect } from "react";
import { LuSave, LuSaveOff } from "react-icons/lu";
import "./Card.css";

const Card = ({
  difficulty = "Med.",
  title = "Full Stack Challenge",
  creator = "bhavith",
  tags = ["Web Dev", "Full Stack"],
  path = "/FullStackWebDev.png",
  onClick=onClick
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Check difficulty styling
  const getDifficultyClass = (difficulty) => {
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

  // Popup utility
  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  // Check if card is already saved on mount
  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/saved");
        if (!res.ok) return;

        const savedCards = await res.json();
        const found = savedCards.some(
          (card) => card.title === title && card.imageUrl === path
        );
        setIsSaved(found);
      } catch (error) {
        console.error("Error checking saved state:", error);
      }
    };

    checkIfSaved();
  }, [title, path]);

  // Save handler
  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl: path }),
      });

      if (response.ok) {
        setIsSaved(true);
        showPopup("✅ Saved successfully!");
      } else {
        const data = await response.json();
        console.error("Save failed:", data);
        showPopup("❌ Failed to save card.");
      }
    } catch (error) {
      console.error("Network error:", error);
      showPopup("⚠️ Error saving card.");
    }
  };

  // Unsave handler
  const handleUnsave = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/unsave", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl: path }),
      });

      if (response.ok) {
        setIsSaved(false);
        showPopup("🗑️ Unsaved successfully!");
      } else {
        const data = await response.json();
        console.error("Unsave failed:", data);
        showPopup("❌ Failed to unsave card.");
      }
    } catch (error) {
      console.error("Network error:", error);
      showPopup("⚠️ Error unsaving card.");
    }
  };

  return (
    <>
      <div
        className="challenge-card"
        style={{ backgroundImage: `url(${path})` }}
        onClick={onClick}
      >
        <div className="gradient-overlay"></div>
        <div className="bottom-blur"></div>

        <div className="card-content1">
          {/* Top section with difficulty */}
          <div className="top-section1">
            <div
              className={`difficulty-badge ${getDifficultyClass(difficulty)}`}
            >
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
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            {/* Save / Unsave button */}
            {isSaved ? (
              <button className="save-button" onClick={handleUnsave}>
                <LuSaveOff size={20} />
              </button>
            ) : (
              <button className="save-button" onClick={handleSave}>
                <LuSave size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popup message */}
      {popupMessage && <div className="popup-message">{popupMessage}</div>}
    </>
  );
};

export default Card;

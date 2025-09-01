import { useState, useEffect } from "react";
import { LuHeart } from "react-icons/lu";
import "./Card.css";

const Card = ({
  id = null, // interview id
  difficulty = "Med.",
  title = "Full Stack Challenge",
  creator = "bhavith",
  tags = ["Web Dev", "Full Stack"],
  path = "/FullStackWebDev.png",
  onClick = () => {},
  onSaveToggle = () => {} // NEW: callback (id, isSaved)
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isClicked, setIsClicked] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token'); // make sure token is stored on login
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

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

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const headers = { "Content-Type": "application/json", ...getAuthHeader() };
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/saved`, { headers });
        if (!res.ok) {
          // If unauthorized or other error, assume not saved
          return;
        }
        const savedCards = await res.json();
        const found = savedCards.some(
          (card) =>
            (id && card.interviewId && card.interviewId === id) ||
            (card.title === title && card.imageUrl === path)
        );
        setIsSaved(found);
      } catch (error) {
        console.error("Error checking saved state:", error);
      }
    };

    checkIfSaved();
  }, [title, path, id]);

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);

    try {
      const headers = { "Content-Type": "application/json", ...getAuthHeader() };
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/save`, {
        method: "POST",
        headers,
        body: JSON.stringify({ interviewId: id, title, imageUrl: path }),
      });

      if (response.ok) {
        setIsSaved(true);
        showPopup("✅ Saved successfully!");
        try { onSaveToggle(id, true); } catch(e){/* ignore */} // notify parent
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

  const handleUnsave = async (e) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);

    try {
      const headers = { "Content-Type": "application/json", ...getAuthHeader() };
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/unsave`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ interviewId: id, title, imageUrl: path }),
      });

      if (response.ok) {
        setIsSaved(false);
        showPopup("🗑️ Unsaved successfully!");
        try { onSaveToggle(id, false); } catch(e){/* ignore */} // notify parent
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

        <div className="hover-save-container">
          <button
            className={`hover-save-button ${isSaved ? 'saved' : ''} ${isClicked ? 'clicked' : ''}`}
            onClick={isSaved ? handleUnsave : handleSave}
            title={isSaved ? "Remove from saved" : "Save card"}
          >
            <div className="save-icon">
              {isSaved ? <LuHeart size={20} fill="currentColor" /> : <LuHeart size={20} />}
            </div>
          </button>
        </div>

        <div className="card-content1">
          <div className="top-section1">
            <div className={`difficulty-badge ${getDifficultyClass(difficulty)}`}>
              {difficulty}
            </div>
          </div>

          <div className="bottom-section1">
            <div>
              <h2 className="title134">{title}</h2>
              <p className="creator">Created by {creator}</p>
            </div>

            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {popupMessage && <div className="popup-message">{popupMessage}</div>}
    </>
  );
};

export default Card;
import { useState } from "react";
import { LuSave, LuSaveOff } from "react-icons/lu";
import "./CardFolder.css";

export default function CardFolder(props) {
  const [isSaved, setIsSaved] = useState(props.isSaved || false);
  const [popupMessage, setPopupMessage] = useState("");

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2000);
  };

  const handleSave = async () => {
    const title = props.title;
    const imageUrl = props.path;

    try {
      const response = await fetch("http://localhost:5000/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl }),
      });

      if (response.ok) {
        setIsSaved(true);
        showPopup("✅ Saved successfully!");
      } else {
        showPopup("❌ Failed to save card.");
      }
    } catch {
      showPopup("⚠️ Error saving card.");
    }
  };

  const handleUnsave = async () => {
    const title = props.title;
    const imageUrl = props.path;

    try {
      const response = await fetch("http://localhost:5000/api/unsave", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl }),
      });

      if (response.ok) {
        setIsSaved(false);
        showPopup("🗑️ Unsaved successfully!");
      } else {
        showPopup("❌ Failed to unsave card.");
      }
    } catch {
      showPopup("⚠️ Error unsaving card.");
    }
  };

  return (
    <>
      <div
        className="cardfol-background"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${props.path})`,
        }}
      >
        <div className="card-content-section">
          <div className="card-bottom-section">
            <div className="bott">
              <h2 className="cardfoldertitle">{props.title}</h2>
              <p className="numberofquestion1">145 Packs</p>
              <div className="profile-avatars">
                {[...Array(5)].map((_, i) => (
                  <div className="avatar-container" key={i}>
                    <img
                      src="/placeholder.svg?height=27&width=27"
                      alt={`Profile ${i + 1}`}
                      className="avatar"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="save-button-wrapper">
          {isSaved ? (
            <button onClick={handleUnsave} className="save-btn">
              <LuSaveOff size={20} />
            </button>
          ) : (
            <button onClick={handleSave} className="save-btn">
              <LuSave size={20} />
            </button>
          )}
        </div>
      </div>

      {popupMessage && <div className="popup-message">{popupMessage}</div>}
    </>
  );
}

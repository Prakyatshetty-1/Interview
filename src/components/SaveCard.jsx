import "./CardFolder.css";

export default function SaveCard(props) {
  const handleUnsave = async () => {
    if (!props.id) {
      alert("Missing card ID.");
      return;
    }

    console.log("Unsaving card with ID:", props.id);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/saved/${props.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Unsave successful:", data);
        alert("Card unsaved successfully!");
        // Optional: Trigger a parent state update to remove the card from UI
        if (props.onUnsave) {
          props.onUnsave(props.id);
        }
      } else {
        console.error("Unsave failed:", data);
        alert("Failed to unsave card.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Error unsaving card.");
    }
  };

  return (
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
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div className="avatar-container" key={index}>
                  <img
                    src="/placeholder.svg?height=27&width=27"
                    alt={`Profile ${index + 1}`}
                    className="avatar"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="save-button-wrapper">
        <button onClick={handleUnsave}>Unsave</button>
      </div>
    </div>
  );
}
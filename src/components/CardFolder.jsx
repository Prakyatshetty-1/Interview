import "./CardFolder.css";

export default function CardFolder(props) {
  return (
    <div
      className="cardfol-background"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${props.path})`,
      }}
      onClick={props.onClick}
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
    </div>
  );
}
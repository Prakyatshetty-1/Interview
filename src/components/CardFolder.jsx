import "./CardFolder.css"

export default function CardFolder(props) {

//   const handleClick = async () => {
//   const title = props.title;
//   const imageUrl = props.path;
//   console.log("Saving:", title, imageUrl);

//   try {
//     const response = await fetch("http://localhost:5000/api/save", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ title, imageUrl }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       console.log("Saved successfully:", data);
//       alert("Card saved!");
//     } else {
//       console.error("Save failed:", data);
//       alert("Failed to save card.");
//     }
//   } catch (error) {
//     console.error("Network error:", error);
//     alert("Error saving card.");
//   }
// };

  return (
    <>
      <div
        className="cardfol-background"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${props.path})`,
        }}
      >
        <div className="card-content-section">
          {/* Bottom section */}
          <div className="card-bottom-section">
            <div className="bott">
              <div className="combino">
                <h2 className="cardfoldertitle">{props.title}</h2>
              <p className="numberofquestion1">145 Interviews</p>
              </div>
              
              <div className="profile-avatars">
                <div className="avatar-container">
                  <img src="./profilepic1.png" alt="Profile 1" className="avatar" />
                </div>
                <div className="avatar-container">
                  <img src="./profilepic2.png" alt="Profile 2" className="avatar" />
                </div>
                <div className="avatar-container">
                  <img src="./profilepic3.png" alt="Profile 3" className="avatar" />
                </div>
               
              </div>
            </div>
          </div>
        </div>
        {/* Add the save button wrapper here */}
        {/* <div className="save-button-wrapper">
          <button onClick={handleClick}> save</button>
        </div> */}
      </div>
    </>
  )
}
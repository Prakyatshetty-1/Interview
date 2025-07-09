import './CardFolder.css';

export default function CardFolder(props){
    return (
        <>
          <div className="cardfol-background" style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(./Google.png)` 
          }}>
            <div className="card-content-section">
              {/* Bottom section */}
              <div className="card-bottom-section">
                <div className='bott'>
                  <h2 className="cardfoldertitle">{props.title}</h2>
                  <p className='numberofquestion1'>145 Packs</p>
                  <div className="profile-avatars">
                    <div className="avatar-container">
                      <img src="./profile1.jpg" alt="Profile 1" className="avatar" />
                    </div>
                    <div className="avatar-container">
                      <img src="./profile2.jpg" alt="Profile 2" className="avatar" />
                    </div>
                    <div className="avatar-container">
                      <img src="./profile3.jpg" alt="Profile 3" className="avatar" />
                    </div>
                    <div className="avatar-container">
                      <img src="./profile4.jpg" alt="Profile 3" className="avatar" />
                    </div>
                    <div className="avatar-container">
                      <img src="./profile5.jpg" alt="Profile 3" className="avatar" />
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
    )
}
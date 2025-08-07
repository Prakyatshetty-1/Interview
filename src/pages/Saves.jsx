import './Saves.css';
import Dock from '../react-bits/Dock';

export default function Saves(){
    const items = [
    {
      icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />,
      label: "Home",
      onClick: () => alert("Home!"),
    },
    {
      icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />,
      label: "Interviews",
      onClick: () => alert("Interviews!"),
    },
    {
      icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />,
      label: "Create",
      onClick: () => alert("Create!"),
    },
    {
      icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />,
      label: "Saves",
      onClick: () => alert("Saves!"),
    },
    {
      icon: <img src="/settingsicon.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Settings",
      onClick: () => alert("Settings!"),
    },
    {
      icon: <img src="/settingsicon.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Settings",
      onClick: () => alert("Settings!"),
    },
    {
      icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />,
      label: "Profile",
      onClick: () => alert("Profile!"),
    },
  
    {
      icon: <img src="/settingsicon.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Settings",
      onClick: () => alert("Settings!"),
    },
  ];
    return(
<>
<div className="containsaves">
    <div className="logo-containernew">
        <span className="logonew">Askora</span>
      </div>
      <div className="nosavesyet">
        <img src="./saves.png" alt="" className="nosave" />
       <h1>Still waiting for your first save!</h1>
      </div>
            <Dock
                items={items}
                panelHeight={78}
                baseItemSize={60}
                magnification={80}
              />
</div>
</>
    );
}
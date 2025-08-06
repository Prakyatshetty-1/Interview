import './Saves.css';
import Dock from '../react-bits/Dock';
import { useNavigate } from 'react-router-dom';
import CardFolder from '../components/CardFolder'
import SlidingCard from '../components/SlidingCard';


export default function Saves() {
    const navigate=useNavigate();
    const items = [
    {
      icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />,
      label: "Home",
      onClick: () => navigate('/'),
    },
    {
      icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />,
      label: "Interviews",
      onClick: () => navigate('/Interview'),
    },
    {
      icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />,
      label: "Create",
      onClick: () => navigate('/Create'),
    },
    {
      icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />,
      label: "Saves",
      onClick: () => navigate('/Saves'),
    },
    
    {
      icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />,
      label: "Profile",
      onClick: () => navigate('/Profile'),
    },
  
    {
      icon: <img src="/settingsicon.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Settings",
      onClick: () => alert("Settings!"),
    },
  ];
    return (
        <>
            <div className="containsaves">
                <div className="logo-containernew">
                    <span className="logonew">Askora</span>
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
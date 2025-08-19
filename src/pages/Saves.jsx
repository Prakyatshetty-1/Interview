import './Saves.css';
import Dock from '../react-bits/Dock';

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SaveCard from '../components/SaveCard';
import { color } from 'framer-motion';

export default function Saves() {
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState([]);

  // Fetch saved cards from backend
  const fetchSavedCards = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/saved");
      if (!res.ok) throw new Error("Failed to fetch saved cards");
      const data = await res.json();
      setSavedCards(data);
    } catch (err) {
      console.error("Error fetching saved cards:", err);
    }
  };

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const items = [
    { icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />, label: "Home", onClick: () => navigate('/Dashboard') },
    { icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />, label: "Interviews", onClick: () => navigate('/Interview') },
    { icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />, label: "Create", onClick: () => navigate('/Create') },
    { icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />, label: "Saves", onClick: () => navigate('/Saves') },
    { icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />, label: "Profile", onClick: () => navigate('/Profile') },
     {
      icon: <img src="/ViewProfile.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Explore",
       onClick: () => navigate('/ViewProfile'),
    },
  ];

  return (
    <div className="containsaves">
      <div className="dashboard-bg-orbs">
  <div className="dashboard-orb dashboard-orb1"></div>
  <div className="dashboard-orb dashboard-orb2"></div>
  <div className="dashboard-orb dashboard-orb3"></div>
  <div className="dashboard-orb dashboard-orb4"></div>
  <div className="dashboard-orb dashboard-orb5"></div>
</div>
      <div className="logo-containernew">
        <span className="logonew">Askora</span>
      </div>

      {/* Saved Cards */}
      <div className="saved-cards-container">
        {savedCards.length > 0 ? (
          savedCards.map((card) => (
            <SaveCard
              key={card._id}
              id={card._id}
              title={card.title}
              path={card.imageUrl}
            />
          ))
        ) : (
          <div className="nosavesyet">
        <img src="./saves.png" alt="" className="nosave" />
       <h1>Still waiting for your first save!</h1>
      </div>
        )}
      </div>

      <Dock
        items={items}
        panelHeight={78}
        baseItemSize={60}
        magnification={80}
      />
    </div>
  );

}
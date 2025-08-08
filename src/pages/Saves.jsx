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
    { icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />, label: "Home", onClick: () => navigate('/') },
    { icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />, label: "Interviews", onClick: () => navigate('/Interview') },
    { icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />, label: "Create", onClick: () => navigate('/Create') },
    { icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />, label: "Saves", onClick: () => navigate('/Saves') },
    { icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />, label: "Profile", onClick: () => navigate('/Profile') },
    { icon: <img src="/settingsicon.png" alt="Settings" style={{ width: '48px', height: '48px' }} />, label: "Settings", onClick: () => alert("Settings!") },
  ];

  return (
    <div className="containsaves1">
      <div className="logo-containernew1">
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
          <p className='logonew'>No saved cards found.</p>
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

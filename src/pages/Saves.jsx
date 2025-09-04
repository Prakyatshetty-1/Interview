import './Saves.css';
import Dock from '../react-bits/Dock';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Card from '../components/Card'; // <-- use same Card
// import SaveCard from '../components/SaveCard'; // remove this import

export default function Saves() {
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState([]);

  const fetchSavedCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/saved`, { headers });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.warn('Unauthorized - redirect to login');
        }
        throw new Error("Failed to fetch saved cards");
      }
      const data = await res.json();
      setSavedCards(data);
    } catch (err) {
      console.error("Error fetching saved cards:", err);
    }
  };

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const handleCardUnsaved = (savedDocId) => {
    // Remove the saved document (the _id of saved record) from UI
    setSavedCards((prev) => prev.filter((s) => s._id !== savedDocId));
  };

  const items = [
  { 
    icon: <img 
            src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975111/askora_public/homeicon.png" 
            alt="Home" 
            style={{ width: 48, height: 48 }} 
            loading="lazy"
          />, 
    label: "Home", 
    onClick: () => navigate('/Dashboard') 
  },
  { 
    icon: <img 
            src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975117/askora_public/interviewicon.png" 
            alt="Interviews" 
            style={{ width: 48, height: 48 }} 
            loading="lazy"
          />, 
    label: "Interviews", 
    onClick: () => navigate('/Interview') 
  },
  { 
    icon: <img 
            src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975063/askora_public/createicon.png" 
            alt="Create" 
            style={{ width: 48, height: 48 }} 
            loading="lazy"
          />, 
    label: "Create", 
    onClick: () => navigate('/Create') 
  },
  { 
    icon: <img 
            src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975089/askora_public/favicon.png" 
            alt="Saves" 
            style={{ width: 48, height: 48 }} 
            loading="lazy"
          />, 
    label: "Saves", 
    onClick: () => navigate('/Saves') 
  },
  { 
    icon: <img 
            src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975168/askora_public/profileicon.png" 
            alt="Profile" 
            style={{ width: 48, height: 48 }} 
            loading="lazy"
          />, 
    label: "Profile", 
    onClick: () => navigate('/Profile') 
  },
  { 
    icon: <img 
            src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975204/askora_public/ViewProfile.png" 
            alt="Explore" 
            style={{ width: 48, height: 48 }} 
            loading="lazy"
          />, 
    label: "Explore", 
    onClick: () => navigate('/ViewProfile') 
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
          savedCards.map((card) => {
            // 'card' is the saved-document from the user.saves array
            // it might contain interviewId, title, imageUrl, _id (saved-doc id)
            const interviewIdOrFallback = card.interviewId || card._id;
            return (
              <Card
                key={card._id}
                id={interviewIdOrFallback}
                title={card.title}
                path={card.imageUrl}
                creator={card.creator || "askora"} // fallback if creator not saved
                tags={card.tags || ["Saved"]}
                onClick={() => navigate(`/interview/${interviewIdOrFallback}`)}
                onSaveToggle={(id, isSaved) => {
                  if (!isSaved) {
                    // when Card reports unsaved, remove this saved document from UI
                    handleCardUnsaved(card._id);
                  }
                }}
              />
            );
          })
        ) : (
          <div className="nosavesyet">
            <img src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975183/askora_public/saves.png" 
            loading='lazy' alt="" className="nosave" />
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

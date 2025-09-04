import HeaderCard from "../components/HeaderCard";
import "./Dashboard.css";
import Dock from "../react-bits/Dock";
import TopicFilter from "../components/TopicFilter";
import Topics from "../components/Topics";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/interview/${id}`);
  };

 const dockItems = [
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
    <div className="body-container">
      <div className="logo-containernew">
        <span className="logonew">Askora</span>
      </div>
      <div className="mainbody">
       <div className="dashboard-bg-orbs">
  <div className="dashboard-orb dashboard-orb1"></div>
  <div className="dashboard-orb dashboard-orb2"></div>
  <div className="dashboard-orb dashboard-orb3"></div>
  <div className="dashboard-orb dashboard-orb4"></div>
  <div className="dashboard-orb dashboard-orb5"></div>
</div>
        <HeaderCard />
        <Topics/>
        <TopicFilter/>
        <div className="horizontal-divider"></div>


        {/* SearchBar now owns fetching and rendering the cards. supply a click handler */}
        <SearchBar onCardClick={handleCardClick} />

        <Dock items={dockItems} panelHeight={78} baseItemSize={60} magnification={80} />
      </div>
    </div>
  );
}

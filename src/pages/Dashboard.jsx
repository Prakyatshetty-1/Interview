import HeaderCard from "../components/HeaderCard";
import "./Dashboard.css";
import Dock from "../react-bits/Dock";
import TopicFilter from "../components/TopicFilter";
import Topics from "../components/Topics";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
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
      icon: <img src="/ViewProfile.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Explore",
       onClick: () => navigate('/ViewProfile'),
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
        <SearchBar/>
        <Dock
          items={items}
          panelHeight={78}
          baseItemSize={60}
          magnification={80}
        />
      </div>
    </div>
  );
}
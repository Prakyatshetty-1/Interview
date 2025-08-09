import SlidingCard from "../components/SlidingCard";
import Dock from "../react-bits/Dock";
import './InterviewPage.css';
import { useNavigate } from "react-router-dom";

function InterviewPage() {
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
    <div className="body-container2">
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

      <div className="containersall">
        <div className="headsecc">
          <p>Welcome to</p>
          <div class="cardint">
            <div class="loaderint">
              <p>Askora</p>
              <div class="wordsint">
                <span class="wordint">Share</span>
                <span class="wordint">Interview</span>
                <span class="wordint">Create</span>
                <span class="wordint">Learn</span>
                <span class="wordint">Practise</span>
              </div>
            </div>
          </div>
        </div>
        <SlidingCard tag="Recently Viewed" />
        <SlidingCard tag="Recommended" />
        <SlidingCard tag="Featured" />
        <SlidingCard tag="Top Companies" />
        <SlidingCard tag="Popular" />
        <SlidingCard tag="Paid" />
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
export default InterviewPage;
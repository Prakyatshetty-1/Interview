import SlidingCard from "../components/SlidingCard";
import Dock from "../react-bits/Dock";
import CardFolder from "../components/CardFolder";
import './InterviewPage.css';
const items = [
  {
    icon: (
      <img
        src="/homeicon.png"
        alt="Home"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Home",
    onClick: () => alert("Home!"),
  },
  {
    icon: (
      <img
        src="/interviewicon.png"
        alt="Interviews"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Interviews",
    onClick: () => alert("Interviews!"),
  },
  {
    icon: (
      <img
        src="/createicon.png"
        alt="Create"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Create",
    onClick: () => alert("Create!"),
  },
  {
    icon: (
      <img
        src="/favicon.png"
        alt="Saves"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Saves",
    onClick: () => alert("Saves!"),
  },
  {
    icon: (
      <img
        src="/settingsicon.png"
        alt="Settings"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Settings",
    onClick: () => alert("Settings!"),
  },
  {
    icon: (
      <img
        src="/settingsicon.png"
        alt="Settings"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Settings",
    onClick: () => alert("Settings!"),
  },
  {
    icon: (
      <img
        src="/profileicon.png"
        alt="Profile"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Profile",
    onClick: () => alert("Profile!"),
  },

  {
    icon: (
      <img
        src="/settingsicon.png"
        alt="Settings"
        style={{ width: "48px", height: "48px" }}
      />
    ),
    label: "Settings",
    onClick: () => alert("Settings!"),
  },
];
function InterviewPage() {
  return (
    <div className="body-container2">
      <div className="logo-containernew">
        <span className="logonew">Askora</span>
      </div>
      
      <div className="containersall">
   
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

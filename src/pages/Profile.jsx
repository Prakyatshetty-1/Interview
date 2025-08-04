import HeatMap from "../components/HeatMap";
import Dock from "../react-bits/Dock";
import LeetcodeMeter from "../components/LeetcodeMeter";
import Card from "../components/Card"
import "./Profile.css";
import { useNavigate } from "react-router-dom";

export default function Profile() {
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
            <div className="profilecontain">
                <div className="logo-containernew">
                    <span className="logonew">Askora</span>
                </div>
                <div className="outerprof">
                    <div className="leftprof">
                        <div className="upperleftprof">
                            <div className="rightprofpic"></div>
                            <div className="infoleftprof">
                                <h1>Bhaviths22</h1>
                                <div className="followstats">  <p><span className="spanmast">40</span> Follower</p>
                                    <p><span className="spanmast">194</span> Following</p></div>

                                <h2>Rank<span className="spanmast2">900,322</span> </h2>
                            </div>

                        </div>
                        <button
                            style={{
                                backgroundColor: '#6b21a8',
                                color: '#c084fc',
                                border: '1px solid #9333ea',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                                lineHeight: '20px',
                                width: 'calc(100% - 48px)',
                                marginLeft: '24px',
                                marginTop: '20px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#9333ea';
                                e.target.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#6b21a8';
                                e.target.style.color = '#c084fc';
                            }}
                            onClick={() => {
                                console.log('Edit Profile clicked');
                            }}
                        >
                            Edit Profile
                        </button>
                        <div class="horizontal-line"></div>
                        <LeetcodeMeter />
                        <div class="horizontal-line"></div>
                    </div>
                    <div className="rightprof">
                        <div className="upperrightprof">
                            <div className="profpicss"></div>
                            <div className="aboutprof">
                                <h1>About me</h1>
                                <p>
                                    I'm Bhavith Shetty, a creative developer and designer
                                    passionate about building digital experiences that are both
                                    functional and emotionally engaging. My work spans across web
                                    development, game design, and AI-powered applications — with a
                                    strong focus on clean design, user-first thinking, and
                                    innovation. From building interactive websites and sustainable
                                    fashion recommendation systems to crafting pixel-art games
                                    that tell heartfelt stories, I enjoy turning ideas into
                                    meaningful and impactful products.
                                </p>
                            </div>
                        </div>
                        <HeatMap />
                        <div className="recentlyviewinterviews">
                            <div className="upperrecenttext">
                                <h1>Recently Viewed</h1>
                            </div>
                            <div className="cardsrecent">
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                                <Card />
                            </div>
                        </div>
                    </div>
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
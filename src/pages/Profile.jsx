import { useState } from "react";
import { FiEdit2, FiCamera, FiX, FiPlus, FiTrash2, FiAward, FiTrendingUp, FiCalendar, FiClock, FiStar, FiBookOpen, FiTarget, FiUsers, FiCode, FiDatabase, FiGitBranch } from "react-icons/fi";
import HeatMap from '../components/HeatMap';
import { useNavigate } from "react-router-dom";
import Dock from '../react-bits/Dock'
import './Profile.css';
import LeetcodeMeter from "../components/LeetcodeMeter";



const Card = ({ title = "System Design Interview", company = "Google", difficulty = "Hard", duration = "45 min" }) => (
  <div style={{
    background: 'rgba(15, 16, 31, 0.8)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #333',
    minWidth: '200px'
  }}>
    <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '8px' }}>{title}</h4>
    <p style={{ color: '#9333ea', fontSize: '12px', marginBottom: '4px' }}>{company}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8f8f8f' }}>
      <span>{difficulty}</span>
      <span>{duration}</span>
    </div>
  </div>
);



export default function Profile() {
  const [aboutText, setAboutText] = useState(
    "I'm Bhavith Shetty, a creative developer and designer passionate about building digital experiences that are both functional and emotionally engaging. My work spans across web development, game design, and AI-powered applications — with a strong focus on clean design, user-first thinking, and innovation."
  );
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempAboutText, setTempAboutText] = useState(aboutText);
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
  // Profile data state
  const [profileData, setProfileData] = useState({
    username: "Bhaviths22",
    fullName: "Bhavith Shetty",
    company: "Tech Innovators Inc.",
    education: "Computer Science, MIT",
    interests: ["Web Development", "Game Design", "AI/ML", "UI/UX Design", "Photography"]
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfileData, setTempProfileData] = useState(profileData);
  const [newInterest, setNewInterest] = useState("");

  // Skills data
  const [skills] = useState({
    technical: [
      { name: "JavaScript", level: 90, color: "#f7df1e" },
      { name: "React", level: 85, color: "#61dafb" },
      { name: "Python", level: 88, color: "#3776ab" },
      { name: "Node.js", level: 80, color: "#339933" },
      { name: "SQL", level: 75, color: "#336791" },
      { name: "System Design", level: 70, color: "#9333ea" }
    ],
    soft: [
      { name: "Communication", level: 92 },
      { name: "Problem Solving", level: 88 },
      { name: "Leadership", level: 85 },
      { name: "Teamwork", level: 90 }
    ]
  });

  // Achievements data
  const [achievements] = useState([
    { title: "Top Performer", description: "Ranked in top 5% globally", icon: <FiAward />, color: "#ffd700" },
    { title: "Problem Solver", description: "Solved 250+ coding problems", icon: <FiCode />, color: "#9333ea" },
    { title: "Interview Expert", description: "95% success rate in mock interviews", icon: <FiTarget />, color: "#10b981" },
    { title: "Mentor", description: "Helped 50+ candidates", icon: <FiUsers />, color: "#f59e0b" }
  ]);

  // Interview stats
  const [interviewStats] = useState({
    totalInterviews: 47,
    successRate: 89,
    avgRating: 4.7,
    totalPracticeHours: 156,
    streak: 12,
    favTopics: ["System Design", "Data Structures", "Algorithms", "Behavioral"]
  });

  // Event handlers
  const handleAboutEditClick = () => {
    setIsEditingAbout(true);
    setTempAboutText(aboutText);
  };

  const handleAboutSave = () => {
    setAboutText(tempAboutText);
    setIsEditingAbout(false);
  };

  const handleAboutCancel = () => {
    setTempAboutText(aboutText);
    setIsEditingAbout(false);
  };

  const handleProfileEditClick = () => {
    setIsEditingProfile(true);
    setTempProfileData({ ...profileData });
  };

  const handleProfileSave = () => {
    setProfileData({ ...tempProfileData });
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setTempProfileData({ ...profileData });
    setIsEditingProfile(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !tempProfileData.interests.includes(newInterest.trim())) {
      setTempProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest) => {
    setTempProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleProfilePicChange = () => {
    alert("Profile picture change functionality would be implemented here");
  };



  return (
    <>
      <div style={{
        width: '100%',
        height:'2200px',
        backgroundColor: 'rgba(15, 16, 31, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
      }}>
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

        <div style={{
          width: '100%',
          maxWidth: '1600px',
          marginTop: '100px',
          display: 'flex',
          gap: '30px',
          zIndex: 1,
          padding: '0 20px'
        }}>
          {/* Left Panel */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'rgba(15, 16, 31, 0.6)',
            borderRadius: '24px',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            height: '2000px', // Use full available height
  overflowY: 'auto', // Only vertical scrolling when needed
  overflowX: 'hidden' // No horizontal scrolling
          }}>
            {/* Profile Header */}
            <div style={{
              display: 'flex',
              marginTop: '24px',
              marginLeft: '24px',
              gap: '20px'
            }}>
             <div className="rightprofpic"></div>
              <div style={{
                color: 'white',
                marginTop: '30px'
              }}>
                <h1 style={{
                  fontSize: '17px',
                  fontWeight: '500',
                  margin: '0 0 10px 0'
                }}>{profileData.username}</h1>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    color: '#8f8f8f',
                    margin: 0
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>40</span> Followers
                  </p>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '400',
                    color: '#8f8f8f',
                    margin: 0
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>194</span> Following
                  </p>
                </div>
                <h2 style={{
                  color: '#8f8f8f',
                  fontSize: '17px',
                  fontWeight: '400',
                  marginTop: '30px',
                  margin: '30px 0 0 0'
                }}>
                  Rank <span style={{
                    color: 'white',
                    fontSize: '17px',
                    fontWeight: '600',
                    marginLeft: '5px'
                  }}>900,322</span>
                </h2>
              </div>
            </div>

            <button
              style={{
                backgroundColor: '#6b21a8',
                color: 'white',
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
                e.target.style.color = 'white';
              }}
              onClick={handleProfileEditClick}
            >
              Edit Profile
            </button>

            <div style={{
              height: '1px',
              backgroundColor: '#353535',
              width: 'calc(100% - 20px)',
              marginLeft: '10px',
              marginTop: '20px'
            }}></div>

            <LeetcodeMeter />

            <div style={{
              height: '1px',
              backgroundColor: '#353535',
              width: 'calc(100% - 20px)',
              marginLeft: '10px',
              marginTop: '20px'
            }}></div>

            {/* Interview Performance Stats */}
            <div style={{
              padding: '20px',
              color: '#ffffff'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTrendingUp /> Performance
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(147, 51, 234, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9333ea' }}>{interviewStats.totalInterviews}</div>
                  <div style={{ fontSize: '12px', color: '#8f8f8f' }}>Total Interviews</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{interviewStats.successRate}%</div>
                  <div style={{ fontSize: '12px', color: '#8f8f8f' }}>Success Rate</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FiStar size={16} />{interviewStats.avgRating}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8f8f8f' }}>Avg Rating</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b4513' }}>{interviewStats.streak}</div>
                  <div style={{ fontSize: '12px', color: '#8f8f8f' }}>Day Streak</div>
                </div>
              </div>
            </div>

            <div style={{
              height: '1px',
              backgroundColor: '#353535',
              width: 'calc(100% - 20px)',
              marginLeft: '10px',
              marginTop: '20px'
            }}></div>

            {/* Achievements Section */}
            <div style={{
              padding: '20px',
              color: '#ffffff'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiAward /> Achievements
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {achievements.map((achievement, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${achievement.color}20`
                  }}>
                    <div style={{ color: achievement.color, marginRight: '12px', fontSize: '20px' }}>
                      {achievement.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{achievement.title}</div>
                      <div style={{ fontSize: '12px', color: '#8f8f8f' }}>{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
           
              borderRadius: '24px',
              padding: '30px',
              marginBottom: '30px',
             
            }}>
              <h2 style={{
                color: 'white',
                fontSize: '22px',
                fontWeight: '400',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiTrendingUp /> Progress Analytics
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  background: 'rgba(147, 51, 234, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid rgba(147, 51, 234, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9333ea' }}>
                    {interviewStats.totalPracticeHours}
                  </div>
                  <div style={{ color: '#8f8f8f', fontSize: '14px' }}>Practice Hours</div>
                  <div style={{ color: '#10b981', fontSize: '12px', marginTop: '5px' }}>+12 this week</div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                    254
                  </div>
                  <div style={{ color: '#8f8f8f', fontSize: '14px' }}>Problems Solved</div>
                  <div style={{ color: '#10b981', fontSize: '12px', marginTop: '5px' }}>+15 this week</div>
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                    23
                  </div>
                  <div style={{ color: '#8f8f8f', fontSize: '14px' }}>Mock Interviews</div>
                  <div style={{ color: '#10b981', fontSize: '12px', marginTop: '5px' }}>+3 this week</div>
                </div>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>
                    2,847
                  </div>
                  <div style={{ color: '#8f8f8f', fontSize: '14px' }}>Global Rank</div>
                  <div style={{ color: '#10b981', fontSize: '12px', marginTop: '5px' }}>↑ 156 this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{
            height: '100%',
            width: '100%',
            borderRadius: '24px'
            
          }}>
            <div className="upperrightprof">
              <div className="profpicss"></div>
              <div className="aboutprof">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h1>About me</h1>
                  {!isEditingAbout && (
                    <button
                      onClick={handleAboutEditClick}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #9333ea',
                        borderRadius: '50%',
                        padding: '4px 8px',
                        fontSize: '16px',
                        color: '#9333ea',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        marginRight: '40px',
                        marginTop: '-20px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#9333ea';
                        e.target.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#9333ea';
                      }}
                    >
                      <FiEdit2 />
                    </button>
                  )}
                </div>
                
                {isEditingAbout ? (
                  <div>
                    <textarea
                      value={tempAboutText}
                      onChange={(e) => setTempAboutText(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '10px',
                        border: '1px solid #9333ea',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff'
                      }}
                      placeholder="Tell us about yourself..."
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={handleAboutSave}
                        style={{
                          backgroundColor: '#9333ea',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#7c3aed';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#9333ea';
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleAboutCancel}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#9333ea',
                          border: '1px solid #9333ea',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#9333ea';
                          e.target.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#9333ea';
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      cursor: 'pointer',
                      padding: '10px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(147, 51, 234, 0.1)';
                      e.target.style.border = '1px solid rgba(147, 51, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.border = '1px solid transparent';
                    }}
                    onClick={handleAboutEditClick}
                  >
                    {aboutText}
                  </p>
                )}
              </div>
            </div>
             <HeatMap />

            {/* Skills Section */}
            <div style={{
              display: 'flex',
              gap: '30px',
              marginBottom: '30px',
              marginTop:'30px'
            }}>
              {/* Technical Skills */}
              <div style={{
                flex: 1,
                background: 'rgba(15, 16, 31, 0.6)',
                borderRadius: '24px',
                padding: '30px',
                border: '1px solid rgba(147, 51, 234, 0.2)'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: '400',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiCode /> Technical Skills
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {skills.technical.map((skill, index) => (
                    <div key={index}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '5px'
                      }}>
                        <span style={{ color: '#ffffff', fontSize: '14px' }}>{skill.name}</span>
                        <span style={{ color: skill.color, fontSize: '14px', fontWeight: '500' }}>{skill.level}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${skill.level}%`,
                          height: '100%',
                          backgroundColor: skill.color,
                          borderRadius: '3px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div style={{
                flex: 1,
                background: 'rgba(15, 16, 31, 0.6)',
                borderRadius: '24px',
                padding: '30px',
                border: '1px solid rgba(147, 51, 234, 0.2)'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: '400',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiUsers /> Soft Skills
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {skills.soft.map((skill, index) => (
                    <div key={index}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '5px'
                      }}>
                        <span style={{ color: '#ffffff', fontSize: '14px' }}>{skill.name}</span>
                        <span style={{ color: '#9333ea', fontSize: '14px', fontWeight: '500' }}>{skill.level}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#2a2a2a',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${skill.level}%`,
                          height: '100%',
                          backgroundColor: '#9333ea',
                          borderRadius: '3px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Heatmap */}
           

            {/* Interview Topics & Schedule Section */}
            <div style={{
              display: 'flex',
              gap: '30px',
              marginTop: '30px',
              marginBottom: '30px'
            }}>
              {/* Favorite Topics */}
              <div style={{
                flex: 1,
                background: 'rgba(15, 16, 31, 0.6)',
                borderRadius: '24px',
                padding: '30px',
                border: '1px solid rgba(147, 51, 234, 0.2)'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: '400',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiBookOpen /> Favorite Topics
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {interviewStats.favTopics.map((topic, index) => (
                    <span key={index} style={{
                      backgroundColor: '#9333ea',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upcoming Schedule */}
              <div style={{
                flex: 1,
                background: 'rgba(15, 16, 31, 0.6)',
                borderRadius: '24px',
                padding: '30px',
                border: '1px solid rgba(147, 51, 234, 0.2)'
              }}>
                <h2 style={{
                  color: 'white',
                  fontSize: '22px',
                  fontWeight: '400',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiCalendar /> Upcoming Events
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(147, 51, 234, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}>
                    <FiClock style={{ color: '#9333ea', marginRight: '12px' }} />
                    <div>
                      <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>System Design Mock</div>
                      <div style={{ color: '#8f8f8f', fontSize: '12px' }}>Tomorrow, 2:00 PM</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <FiClock style={{ color: '#10b981', marginRight: '12px' }} />
                    <div>
                      <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Behavioral Interview</div>
                      <div style={{ color: '#8f8f8f', fontSize: '12px' }}>Aug 12, 10:00 AM</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    <FiClock style={{ color: '#f59e0b', marginRight: '12px' }} />
                    <div>
                      <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Coding Challenge</div>
                      <div style={{ color: '#8f8f8f', fontSize: '12px' }}>Aug 15, 4:00 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Analytics */}
            

            {/* Recently Viewed Interviews */}
            <div style={{
              width: '100%',
              background: 'rgba(15, 16, 31, 0.6)',
              borderRadius: '24px',
              padding: '30px',
              position: 'relative',
              border: '1px solid rgba(147, 51, 234, 0.2)'
            }}>
              <h1 style={{
                color: 'white',
                fontSize: '22px',
                fontWeight: '400',
                marginBottom: '30px'
              }}>Recently Viewed Interviews</h1>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                <Card title="System Design: Chat Application" company="Meta" difficulty="Hard" duration="60 min" />
                <Card title="Binary Tree Algorithms" company="Google" difficulty="Medium" duration="45 min" />
                <Card title="Database Design Interview" company="Amazon" difficulty="Hard" duration="90 min" />
                <Card title="React Component Design" company="Netflix" difficulty="Medium" duration="45 min" />
                <Card title="Behavioral: Leadership" company="Microsoft" difficulty="Easy" duration="30 min" />
                <Card title="Dynamic Programming" company="Apple" difficulty="Hard" duration="60 min" />
                <Card title="System Design: URL Shortener" company="Uber" difficulty="Hard" duration="75 min" />
                <Card title="Graph Algorithms" company="LinkedIn" difficulty="Medium" duration="45 min" />
                <Card title="API Design Interview" company="Stripe" difficulty="Medium" duration="60 min" />
                <Card title="Machine Learning Systems" company="OpenAI" difficulty="Hard" duration="90 min" />
                <Card title="Frontend Architecture" company="Airbnb" difficulty="Medium" duration="45 min" />
                <Card title="Distributed Systems" company="Dropbox" difficulty="Hard" duration="75 min" />
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

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            padding: '30px',
            width: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid #9333ea'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h2 style={{ color: '#ffffff', margin: 0 }}>Edit Profile</h2>
              <button
                onClick={handleProfileCancel}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9333ea',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Profile Picture Section */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#9333ea',
                margin: '0 auto 10px',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white',
                fontWeight: 'bold'
              }} onClick={handleProfilePicChange}>
                BS
                <button style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: '#9333ea',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiCamera size={12} />
                </button>
              </div>
              <p style={{ color: '#9333ea', fontSize: '12px' }}>Click to change profile picture</p>
            </div>

            {/* Form Fields */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                Username
              </label>
              <input
                type="text"
                value={tempProfileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #9333ea',
                  borderRadius: '6px',
                  backgroundColor: '#2a2a2a',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={tempProfileData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #9333ea',
                  borderRadius: '6px',
                  backgroundColor: '#2a2a2a',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                Company
              </label>
              <input
                type="text"
                value={tempProfileData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #9333ea',
                  borderRadius: '6px',
                  backgroundColor: '#2a2a2a',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                Education
              </label>
              <input
                type="text"
                value={tempProfileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #9333ea',
                  borderRadius: '6px',
                  backgroundColor: '#2a2a2a',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            {/* Interests Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                Interests
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {tempProfileData.interests.map((interest, index) => (
                  <span key={index} style={{
                    backgroundColor: '#9333ea',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {interest}
                    <FiTrash2
                      size={12}
                      style={{ cursor: 'pointer' }}
                      onClick={() => removeInterest(interest)}
                    />
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add new interest"
                  style={{
                    flex: 1,
                    padding: '6px',
                    border: '1px solid #9333ea',
                    borderRadius: '4px',
                    backgroundColor: '#2a2a2a',
                    color: '#ffffff',
                    outline: 'none',
                    fontSize: '12px'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <button
                  onClick={addInterest}
                  style={{
                    backgroundColor: '#9333ea',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <FiPlus size={12} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleProfileCancel}
                style={{
                  backgroundColor: 'transparent',
                  color: '#9333ea',
                  border: '1px solid #9333ea',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#9333ea';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9333ea';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                style={{
                  backgroundColor: '#9333ea',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#9333ea';
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
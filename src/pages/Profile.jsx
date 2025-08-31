// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiEdit2,
  FiCamera,
  FiX,
  FiPlus,
  FiTrash2,
  FiAward,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiStar,
  FiBookOpen,
  FiTarget,
  FiUsers,
  FiCode,
} from "react-icons/fi";
import HeatMap from "../components/HeatMap";
import Dock from "../react-bits/Dock";
import LeetcodeMeter from "../components/LeetcodeMeter";
import CountUp from "../react-bits/CountUp";
import "./Profile.css";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const Card = ({ title = "System Design Interview", company = "Google", difficulty = "Hard", duration = "45 min" }) => (
  <div className="interview-card">
    <h4 className="card-title">{title}</h4>
    <p className="card-company">{company}</p>
    <div className="card-footer">
      <span>{difficulty}</span>
      <span>{duration}</span>
    </div>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const params = useParams();
  // identifier will be defined when route is /profile/:id (viewing another user)
  const identifier = params?.id || params?.username || params?.identifier;
  // If identifier present -> viewing someone else's profile; otherwise own profile.
  const isOwnProfile = !identifier;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempAboutText, setTempAboutText] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfileData, setTempProfileData] = useState({});
  const [newInterest, setNewInterest] = useState("");

  // static skill/achievement data
  const [skills] = useState({
    technical: [
      { name: "JavaScript", level: 90, color: "#f7df1e" },
      { name: "React", level: 85, color: "#61dafb" },
      { name: "Python", level: 88, color: "#3776ab" },
      { name: "Node.js", level: 80, color: "#339933" },
      { name: "SQL", level: 75, color: "#336791" },
      { name: "System Design", level: 70, color: "#9333ea" },
    ],
    soft: [
      { name: "Communication", level: 92 },
      { name: "Problem Solving", level: 88 },
      { name: "Leadership", level: 85 },
      { name: "Teamwork", level: 90 },
    ],
  });

  const [achievements] = useState([
    { title: "Top Performer", description: "Ranked in top 5% globally", icon: <FiAward />, color: "#ffd700" },
    { title: "Problem Solver", description: "Solved 250+ coding problems", icon: <FiCode />, color: "#9333ea" },
    { title: "Interview Expert", description: "95% success rate in mock interviews", icon: <FiTarget />, color: "#10b981" },
    { title: "Mentor", description: "Helped 50+ candidates", icon: <FiUsers />, color: "#f59e0b" },
  ]);

  const interviewStats = {
    totalInterviews: user?.stats?.totalInterviews || 0,
    successRate: user?.stats?.successRate || 0,
    avgRating: user?.stats?.avgRating || 0,
    totalPracticeHours: user?.stats?.totalPracticeHours || 0,
    streak: user?.stats?.streak || 0,
    favTopics: user?.interests || user?.favoriteTopics || ["System Design", "Data Structures", "Algorithms"],
  };

  useEffect(() => {
    fetchUserProfile();
    // re-run when identifier changes (navigating between profiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (identifier) {
        // PUBLIC view for another user (no auth required)
        const res = await fetch(`${API_BASE}/api/users/${identifier}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('User not found');
          throw new Error('Failed to fetch user profile');
        }
        const data = await res.json();
        setUser(data);
        setTempAboutText(data.aboutText || "");
        setTempProfileData({
          username: data.username || data.name || "",
          fullName: data.fullName || data.name || "",
          company: data.company || "",
          education: data.education || "",
          interests: data.interests || data.favoriteTopics || [],
        });
        return;
      }

      // OWN profile: requires auth token
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch profile');
      const userData = await response.json();
      setUser(userData);
      setTempAboutText(userData.aboutText || "");
      setTempProfileData({
        username: userData.username || userData.name,
        fullName: userData.fullName || userData.name,
        company: userData.company || "",
        education: userData.education || "",
        interests: userData.interests || [],
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // update about (only allowed for own profile; server will enforce auth)
  const updateAboutText = async (newAboutText) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await fetch(`${API_BASE}/api/profile/about`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutText: newAboutText }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update about');
      }
      const result = await response.json();
      setUser(prev => ({ ...prev, aboutText: newAboutText }));
      return result;
    } catch (err) {
      console.error('Error updating about:', err);
      throw err;
    }
  };

  // update profile (PUT) - only for own profile
  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const result = await response.json();
      setUser(result.user);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleProfileEditClick = () => {
    if (!isOwnProfile) return; // guard (shouldn't be reachable via UI)
    setIsEditingProfile(true);
    setTempProfileData({
      username: user?.username || user?.name || "",
      fullName: user?.fullName || user?.name || "",
      company: user?.company || "",
      education: user?.education || "",
      interests: user?.interests || [],
    });
  };

  const handleProfileSave = async () => {
    await updateProfile(tempProfileData);
    setIsEditingProfile(false);
  };

  const handleProfileCancel = () => {
    setTempProfileData({
      username: user?.username || user?.name || "",
      fullName: user?.fullName || user?.name || "",
      company: user?.company || "",
      education: user?.education || "",
      interests: user?.interests || [],
    });
    setIsEditingProfile(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !tempProfileData.interests.includes(newInterest.trim())) {
      setTempProfileData(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest) => {
    setTempProfileData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const handleProfilePicChange = () => alert("Profile picture change functionality would be implemented here");

  const items = [
    { icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />, label: "Home", onClick: () => navigate("/") },
    { icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />, label: "Interviews", onClick: () => navigate("/Interview") },
    { icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />, label: "Create", onClick: () => navigate("/Create") },
    { icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />, label: "Saves", onClick: () => navigate("/Saves") },
    { icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />, label: "Profile", onClick: () => navigate("/profile") },
    { icon: <img src="/ViewProfile.png" alt="Explore" style={{ width: '48px', height: '48px' }} />, label: "Explore", onClick: () => navigate("/ViewProfile") },
  ];

  if (loading) {
    return (
      <div className="profile-container">
        <div className="dashboard-bg-orbs">
          <div className="dashboard-orb dashboard-orb1"></div>
          <div className="dashboard-orb dashboard-orb2"></div>
          <div className="dashboard-orb dashboard-orb3"></div>
          <div className="dashboard-orb dashboard-orb4"></div>
          <div className="dashboard-orb dashboard-orb5"></div>
        </div>
        <div className="logo-containernew"><span className="logonew">Askora</span></div>
        <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'50vh',color:'white',fontSize:'18px' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="dashboard-bg-orbs">
          <div className="dashboard-orb dashboard-orb1"></div>
          <div className="dashboard-orb dashboard-orb2"></div>
          <div className="dashboard-orb dashboard-orb3"></div>
          <div className="dashboard-orb dashboard-orb4"></div>
          <div className="dashboard-orb dashboard-orb5"></div>
        </div>
        <div className="logo-containernew"><span className="logonew">Askora</span></div>
        <div style={{ display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'50vh',color:'white',fontSize:'18px',gap:'20px' }}>
          <p>Error loading profile: {error}</p>
          <button onClick={fetchUserProfile} style={{ backgroundColor:'#9333ea', color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',cursor:'pointer' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // MAIN RENDER (unchanged layout except edit gates)
  return (
    <>
      <div className="profile-container">
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

        <div style={{ width: "100%", maxWidth: "1600px", marginTop: "100px", display: "flex", gap: "30px", zIndex: 1, padding: "0 20px" }}>
          {/* Left Panel */}
          <div style={{ width: "100%", maxWidth: "400px", backgroundColor: "rgba(15, 16, 31, 0.6)", borderRadius: "24px", border: "1px solid rgba(147, 51, 234, 0.2)", height: "2000px", overflowY: "auto", overflowX: "hidden" }}>
            {/* Profile Header */}
            <div style={{ display: "flex", marginTop: "24px", marginLeft: "24px", gap: "20px" }}>
              <div className="rightprofpic">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '24px', fontWeight: 'bold', color: 'white' }} />
                )}
              </div>
              <div style={{ color: "white", marginTop: "30px" }}>
                <h1 style={{ fontSize: "17px", fontWeight: "500", margin: "0 0 10px 0" }}>
                  {user?.username || user?.name}
                </h1>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "400", color: "#8f8f8f", margin: 0 }}>
                    <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{user?.stats?.followers || 0}</span> Followers
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: "400", color: "#8f8f8f", margin: 0 }}>
                    <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{user?.stats?.following || 0}</span> Following
                  </p>
                </div>
                <h2 style={{ color: "#8f8f8f", fontSize: "17px", fontWeight: "400", marginTop: "30px", margin: "30px 0 0 0" }}>
                  Rank <span style={{ color: "white", fontSize: "17px", fontWeight: "600", marginLeft: "5px" }}>{user?.stats?.globalRank || "N/A"}</span>
                </h2>
              </div>
            </div>

            {/* Only show "Edit Profile" for your own profile */}
            {isOwnProfile && (
              <button
                style={{ backgroundColor: "#6b21a8", color: "white", border: "1px solid #9333ea", borderRadius: "6px", padding: "8px 16px", fontSize: "14px", fontWeight: "400", cursor: "pointer", transition: "all 0.2s ease", outline: "none", lineHeight: "20px", width: "calc(100% - 48px)", marginLeft: "24px", marginTop: "20px" }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = "#9333ea"; e.target.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = "#6b21a8"; e.target.style.color = "white"; }}
                onClick={handleProfileEditClick}
              >
                Edit Profile
              </button>
            )}

            <div className="divider"></div>

            <LeetcodeMeter
              userId={identifier || user?._id}
              isOwnProfile={isOwnProfile}
              key={identifier || user?._id || 'own'}
            />

            <div className="divider"></div>

            {/* Performance... (rest unchanged) */}
            <div className="performance-section">
              <h3 className="section-title"><FiTrendingUp /> Performance</h3>
              <div className="performance-grid">
                <div className="performance-card performance-card-purple">
                  <div className="performance-value performance-value-purple">
                    <CountUp from={0} to={user?.stats?.totalInterviews || 0} separator="," direction="up" duration={1} className="count-up" />
                  </div>
                  <div className="performance-label">Total Interviews</div>
                </div>
                <div className="performance-card performance-card-green">
                  <div className="performance-value performance-value-green">
                    <CountUp from={0} to={user?.stats?.successRate || 0} separator="," direction="up" duration={1} className="count-up1" />%
                  </div>
                  <div className="performance-label">Success Rate</div>
                </div>
                <div className="performance-card performance-card-yellow">
                  <div className="performance-value performance-value-yellow performance-rating">
                    <FiStar size={16} />
                    <CountUp from={0} to={user?.stats?.avgRating || 0} separator="," direction="up" duration={1} className="count-up2" />
                  </div>
                  <div className="performance-label">Avg Rating</div>
                </div>
                <div className="performance-card performance-card-brown">
                  <div className="performance-value performance-value-brown">
                    <CountUp from={0} to={user?.stats?.streak || 0} separator="," direction="up" duration={1} className="count-up4" />
                  </div>
                  <div className="performance-label">Day Streak</div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            {/* Achievements... (rest unchanged) */}
            <div className="achievements-section">
              <h3 className="section-title"><FiAward /> Achievements</h3>
              <div className="achievements-list">
                {achievements.map((achievement, index) => (
                  <div key={index} className="achievement-item" style={{ border: `1px solid ${achievement.color}20` }}>
                    <div className="achievement-icon" style={{ color: achievement.color }}>{achievement.icon}</div>
                    <div>
                      <div className="achievement-title">{achievement.title}</div>
                      <div className="achievement-description">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress analytics, rest of left panel unchanged */}
          </div>

          {/* Right Panel */}
          <div style={{ height: "100%", width: "100%", borderRadius: "24px" }}>
            <div className="upperrightprof">
              <div className="profpicss">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '48px', fontWeight: 'bold', color: 'white' }} />
                )}
              </div>

              {/* ABOUT SECTION */}
              <div className="aboutprof">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h1>About me</h1>

                  {/* Only show the edit button if you're viewing your own profile */}
                  {isOwnProfile && !isEditingAbout && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditingAbout(true);
                        setTempAboutText(user?.aboutText || "");
                      }}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #9333ea",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        color: "#9333ea",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        marginRight: "40px",
                        marginTop: "-20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e) => { e.target.style.backgroundColor = "#9333ea"; e.target.style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#9333ea"; }}
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                  )}
                </div>

                {isEditingAbout ? (
                  <div style={{ width: "100%" }}>
                    <textarea
                      value={tempAboutText}
                      onChange={(e) => setTempAboutText(e.target.value)}
                      style={{
                        width: "calc(100% - 20px)",
                        minHeight: "120px",
                        padding: "12px",
                        border: "1px solid #9333ea",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        resize: "vertical",
                        outline: "none",
                        backgroundColor: "rgba(26, 26, 26, 0.8)",
                        color: "#ffffff",
                        lineHeight: "1.5",
                      }}
                      placeholder="Tell us about yourself..."
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px", justifyContent: "flex-end" }}>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTempAboutText(user?.aboutText || ""); setIsEditingAbout(false); }} style={{ backgroundColor: "transparent", color: "#9333ea", border: "1px solid #9333ea", borderRadius: "6px", padding: "8px 16px", fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" }}>
                        Cancel
                      </button>
                      <button onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!tempAboutText.trim()) { alert("Please enter some text before saving."); return; }
                        try {
                          setIsEditingAbout(false);
                          await updateAboutText(tempAboutText.trim());
                        } catch (error) {
                          console.error("Error saving about text:", error);
                          setIsEditingAbout(true);
                          alert("Failed to save. Please try again.");
                        }
                      }} disabled={!tempAboutText.trim()} style={{ backgroundColor: tempAboutText.trim() ? "#9333ea" : "#666", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "14px", cursor: tempAboutText.trim() ? "pointer" : "not-allowed", transition: "all 0.2s ease" }}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // make about TEXT clickable only for own profile
                  <div style={{ cursor: isOwnProfile ? "pointer" : "default", padding: "12px", borderRadius: "8px", transition: "all 0.2s ease", border: "1px solid transparent", minHeight: "60px", backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                    onClick={(e) => {
                      if (!isOwnProfile) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditingAbout(true);
                      setTempAboutText(user?.aboutText || "");
                    }}
                    onMouseEnter={(e) => {
                      if (isOwnProfile) { e.target.style.backgroundColor = "rgba(147, 51, 234, 0.1)"; e.target.style.border = "1px solid rgba(147, 51, 234, 0.3)"; }
                    }}
                    onMouseLeave={(e) => {
                      if (isOwnProfile) { e.target.style.backgroundColor = "rgba(255, 255, 255, 0.02)"; e.target.style.border = "1px solid transparent"; }
                    }}
                  >
                    <p style={{ margin: 0, color: user?.aboutText ? "#ffffff" : "#8f8f8f", lineHeight: "1.5", fontSize: "14px" }}>
                      {user?.aboutText || (isOwnProfile ? "Click here to add information about yourself..." : "No information provided.")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <HeatMap
              userId={identifier || user?._id}
              key={identifier || user?._id || 'own'}
            />


            {/* Skills section and rest unchanged... */}
            <div className="skills-section">
              {/* Technical Skills */}
              <div className="skills-panel">
                <h2 className="skills-title"><FiCode /> Technical Skills</h2>
                <div className="skills-list">
                  {skills.technical.map((skill, index) => (
                    <div key={index}>
                      <div className="skill-item-header">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-percentage" style={{ color: skill.color }}>{skill.level}%</span>
                      </div>
                      <div className="skill-bar">
                        <div className="skill-progress" style={{ width: `${skill.level}%`, backgroundColor: skill.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soft skills */}
              <div className="skills-panel">
                <h2 className="skills-title"><FiUsers /> Soft Skills</h2>
                <div className="skills-list">
                  {skills.soft.map((skill, index) => (
                    <div key={index}>
                      <div className="skill-item-header">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-percentage skill-percentage-soft">{skill.level}%</span>
                      </div>
                      <div className="skill-bar">
                        <div className="skill-progress skill-progress-soft" style={{ width: `${skill.level}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* rest of the right panel (topics, schedule, recent interviews) remains unchanged */}
          </div>
        </div>

        <Dock items={items} panelHeight={78} baseItemSize={60} magnification={80} />
      </div>

      {/* Edit Profile Modal: only reachable if isOwnProfile (edit button only shown when own profile) */}
      {isEditingProfile && isOwnProfile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Profile</h2>
              <button className="close-btn" onClick={handleProfileCancel}><FiX /></button>
            </div>

            <div className="profile-pic-edit">
              <div className="profile-pic-large" onClick={handleProfilePicChange}>BS
                <button className="camera-btn"><FiCamera size={12} /></button>
              </div>
              <p className="profile-pic-hint">Click to change profile picture</p>
            </div>

            <div className="form-field">
              <label className="form-label">Username</label>
              <input type="text" className="form-input" value={tempProfileData.username} onChange={(e) => handleInputChange("username", e.target.value)} />
            </div>

            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={tempProfileData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} />
            </div>

            <div className="form-field">
              <label className="form-label">Company</label>
              <input type="text" className="form-input" value={tempProfileData.company} onChange={(e) => handleInputChange("company", e.target.value)} />
            </div>

            <div className="form-field">
              <label className="form-label">Education</label>
              <input type="text" className="form-input" value={tempProfileData.education} onChange={(e) => handleInputChange("education", e.target.value)} />
            </div>

            <div className="interests-section">
              <label className="form-label">Interests</label>
              <div className="interests-tags">
                {tempProfileData.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                    <FiTrash2 size={12} className="remove-interest-btn" onClick={() => removeInterest(interest)} />
                  </span>
                ))}
              </div>
              <div className="add-interest-container">
                <input type="text" className="interest-input" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Add new interest" onKeyPress={(e) => e.key === "Enter" && addInterest()} />
                <button className="add-interest-btn" onClick={addInterest}><FiPlus size={12} /></button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={handleProfileCancel}>Cancel</button>
              <button className="modal-save-btn" onClick={handleProfileSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

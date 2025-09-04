// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
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
const DEFAULT_ABOUT = "This user hasn't added an about yet.";


const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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

  // follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

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

// Profile.jsx - replace existing Card component with this
const Card = ({
  title = "System Design Interview",
  company = "Google",
  difficulty = "Hard",
  duration = "45 min",
  creator = "",
  level = "",
  attemptedAt = null,
  onClick = () => {},
}) => {
  const attemptedLabel = attemptedAt ? new Date(attemptedAt).toLocaleString() : null;
  return (
    <div className="interview-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <h4 className="card-title">{title}</h4>

      {/* creator line */}
      {creator ? <p className="card-creator" style={{ margin: '6px 0 0 0', color: '#cbd5e1', fontSize: '13px' }}>By {creator}</p> : null}

      {/* company or source */}
      {company ? <p className="card-company">{company}</p> : null}

      <div className="card-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}>
        <div className="card-footer" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{difficulty}</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{duration}</span>
        </div>

        {/* level badge (if provided) */}
        {level ? (
          <div style={{
            marginLeft: 'auto',
            padding: '4px 8px',
            borderRadius: 8,
            background: 'rgba(147,51,234,0.12)',
            color: '#e9d5ff',
            fontSize: '12px',
            fontWeight: 600
          }}>
            {level}
          </div>
        ) : null}
      </div>

      {/* attempted time */}
      {attemptedLabel ? (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
          Attempted: {attemptedLabel}
        </div>
      ) : null}
    </div>
  );
};

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);
  
const fileInputRef = useRef(null);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [recentInterviews, setRecentInterviews] = useState([]);

const triggerProfilePicSelect = () => {
  if (fileInputRef.current) fileInputRef.current.click();
};

const uploadFileToCloudinary = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      reject(new Error("Cloudinary config missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env"));
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        if (onProgress) onProgress(pct);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const resp = JSON.parse(xhr.responseText);
            resolve(resp);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.send(formData);
  });
};

const handleFileInputChange = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // Basic client-side validations
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }
  const MAX_MB = 5;
  if (file.size > MAX_MB * 1024 * 1024) {
    alert(`Please pick an image smaller than ${MAX_MB}MB`);
    return;
  }

  try {
    setUploading(true);
    setUploadProgress(0);

    const cloudResp = await uploadFileToCloudinary(file, (pct) => setUploadProgress(pct));
    const imageUrl = cloudResp.secure_url || cloudResp.url;
    if (!imageUrl) throw new Error("No secure_url returned by Cloudinary");

    // Save to your server via existing updateProfile function
    await updateProfile({ profilePicture: imageUrl });

    // update local UI immediately
    setUser(prev => ({ ...prev, profilePicture: imageUrl }));

    alert("Profile picture updated!");
  } catch (err) {
    console.error("Profile pic upload error:", err);
    alert("Failed to upload profile picture: " + (err.message || err));
  } finally {
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = ""; // reset
  }
};

const mergeAndSortRecents = (serverArray = [], localArray = [], limit = 12) => {
  // normalize arrays to objects with id
  const items = [...(serverArray || []), ...(localArray || [])].filter(Boolean);
  // remove duplicates (by id or title+attemptedAt fallback)
  const seen = new Map();
  items.forEach(item => {
    const key = item.id || item.packId || (item.title && item.title + (item.attemptedAt || ""));
    if (!seen.has(key)) {
      seen.set(key, item);
    } else {
      // keep the newest attemptedAt if duplicate
      const existing = seen.get(key);
      if (item.attemptedAt && (!existing.attemptedAt || new Date(item.attemptedAt) > new Date(existing.attemptedAt))) {
        seen.set(key, item);
      }
    }
  });
  const merged = Array.from(seen.values());
  merged.sort((a, b) => {
    const ta = a.attemptedAt ? new Date(a.attemptedAt).getTime() : 0;
    const tb = b.attemptedAt ? new Date(b.attemptedAt).getTime() : 0;
    return tb - ta;
  });
  return merged.slice(0, limit);
};


  // Fetch profile (public or own)
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

        // core state updates
        setUser(data);
        setTempAboutText(data.aboutText || "");
        setTempProfileData({
          username: data.username || data.name || "",
          fullName: data.fullName || data.name || "",
          company: data.company || "",
          education: data.education || "",
          interests: data.interests || data.favoriteTopics || [],
        });

        // initialize follower/following values if present in returned data
        setFollowersCount((data.stats && typeof data.stats.followers === 'number') ? data.stats.followers : 0);
        setFollowingCount((data.stats && typeof data.stats.following === 'number') ? data.stats.following : 0);

        // --- HERE: populate recentInterviews from server only (privacy)
        const serverRecents = data.recentInterviews || data.recentlyAttempted || data.recentlyViewed || [];
        setRecentInterviews(mergeAndSortRecents(serverRecents, [], 12));

        // try to fetch follow-status (if endpoint exists)
        fetchFollowStatus(identifier).catch(() => {});
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

      // core state updates
      setUser(userData);
      setTempAboutText(userData.aboutText || "");
      setTempProfileData({
        username: userData.username || userData.name,
        fullName: userData.fullName || userData.name,
        company: userData.company || "",
        education: userData.education || "",
        interests: userData.interests || [],
      });

      // initialize followers/following counts
      setFollowersCount((userData.stats && typeof userData.stats.followers === 'number') ? userData.stats.followers : 0);
      setFollowingCount((userData.stats && typeof userData.stats.following === 'number') ? userData.stats.following : 0);
      setIsFollowing(false); // can't follow yourself

      // --- HERE: merge server recents with any localStorage fallback (only for own profile)
      const serverRecents = userData.recentInterviews || userData.recentlyAttempted || userData.recentlyViewed || [];

let localRecents = [];
try {
  const token = localStorage.getItem('token');
  const getUserIdFromToken = (token) => {
    if (!token || typeof token !== "string") return null;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(decodeURIComponent(escape(atob(payload))));
      return json.sub || json.userId || json.id || json._id || null;
    } catch (e) {
      return null;
    }
  };
  const userId = getUserIdFromToken(token);
  const baseKey = `recentInterviews_${userId || 'anonymous'}`;
  const parsed = JSON.parse(localStorage.getItem(baseKey) || '[]');
  if (Array.isArray(parsed)) localRecents = parsed;
} catch (e) {
  localRecents = [];
}

setRecentInterviews(mergeAndSortRecents(serverRecents, localRecents, 12));
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  // fetch follow-status helper (optional endpoint on server)
  const fetchFollowStatus = async (targetUserId) => {
    try {
      if (!targetUserId) return;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(targetUserId)}/follow-status`, { headers });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn('fetchFollowStatus non-OK response', res.status, text);
        return;
      }

      const body = await res.json().catch(() => null);
      if (!body) return;

      if (typeof body.isFollowing === 'boolean') setIsFollowing(body.isFollowing);
      if (typeof body.followersCount === 'number') setFollowersCount(body.followersCount);
      if (typeof body.followingCount === 'number') setFollowingCount(body.followingCount);

      return body;
    } catch (err) {
      console.warn('fetchFollowStatus failed', err);
    }
  };

  // follow / unfollow helpers (POST endpoints)
const followUser = async (targetUserId) => {
  try {
    if (!targetUserId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to follow users');
      return;
    }

    setFollowLoading(true);

    // optimistic UI so it feels instant
    setIsFollowing(true);
    setFollowersCount(prev => prev + 1);

    const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(targetUserId)}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    // if server returns non-JSON (error), grab text for meaningful logs
    const textOrJson = await res.text().catch(() => '');
    let body = {};
    try { body = textOrJson ? JSON.parse(textOrJson) : {}; } catch (parseErr) { body = { text: textOrJson }; }

    if (!res.ok) {
      // revert optimistic change
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
      console.error('Follow failed', res.status, body);
      // show server message if provided
      const serverMsg = body?.message || body?.error || body?.text || `Server returned ${res.status}`;
      throw new Error(serverMsg);
    }

    // success: prefer authoritative server counts
    if (typeof body.followersCount === 'number') setFollowersCount(body.followersCount);
    if (typeof body.followingCount === 'number') setFollowingCount(body.followingCount);
    setIsFollowing(true);

    // Re-sync: fetch follow-status and profile from server so ui exactly matches DB
    // Use identifier (username/id) if available; else use returned targetId
    const idToRefetch = identifier || body.targetId || targetUserId;
    await fetchFollowStatus(idToRefetch).catch(() => {});
    // refresh profile data so left-side user.stats (if used) updates on refresh
    await fetchUserProfile();
  } catch (err) {
    console.error('Error following user:', err);
    alert(err.message || 'Failed to follow');
  } finally {
    setFollowLoading(false);
  }
};

const unfollowUser = async (targetUserId) => {
  try {
    if (!targetUserId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to unfollow users');
      return;
    }

    setFollowLoading(true);

    // optimistic
    setIsFollowing(false);
    setFollowersCount(prev => Math.max(0, prev - 1));

    const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(targetUserId)}/unfollow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const textOrJson = await res.text().catch(() => '');
    let body = {};
    try { body = textOrJson ? JSON.parse(textOrJson) : {}; } catch (parseErr) { body = { text: textOrJson }; }

    if (!res.ok) {
      // revert optimistic
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      console.error('Unfollow failed', res.status, body);
      const serverMsg = body?.message || body?.error || body?.text || `Server returned ${res.status}`;
      throw new Error(serverMsg);
    }

    if (typeof body.followersCount === 'number') setFollowersCount(body.followersCount);
    if (typeof body.followingCount === 'number') setFollowingCount(body.followingCount);
    setIsFollowing(false);

    const idToRefetch = identifier || body.targetId || targetUserId;
    await fetchFollowStatus(idToRefetch).catch(() => {});
    await fetchUserProfile();
  } catch (err) {
    console.error('Error unfollowing user:', err);
    alert(err.message || 'Failed to unfollow');
  } finally {
    setFollowLoading(false);
  }
};

  // update about (only allowed for own profile; server will enforce auth)
  // replace your updateAboutText function with this
  const updateAboutText = async (newAboutText) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found (localStorage.token is missing)');

      // quick guard
      if (typeof newAboutText !== 'string') newAboutText = String(newAboutText || '');

      const response = await fetch(`${API_BASE}/api/profile/about`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aboutText: newAboutText }),
      });

      // parse body safely
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[Profile] PATCH /api/profile/about failed:', response.status, payload);
        throw new Error(payload?.message || `Server returned ${response.status}`);
      }

      // Prefer authoritative user returned by server. If not present, fallback to newAboutText.
      const updatedUser = payload?.user || {};
      const storedAbout = updatedUser?.aboutText ?? payload?.aboutText ?? newAboutText;

      // update local state so UI immediately reflects the stored aboutText
      setUser(prev => ({ ...prev, aboutText: storedAbout }));
      setTempAboutText(storedAbout);

      // Re-fetch profile to re-sync other fields if you rely on them (optional)
      // Await ensures subsequent UI uses latest fetch result
      await fetchUserProfile();

      console.log('[Profile] aboutText updated successfully on server');
      return payload;
    } catch (err) {
      console.error('[Profile] updateAboutText error:', err);
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
    if (!isOwnProfile) return;
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

  // MAIN RENDER
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
  <img
    src={user.profilePicture}
    alt="Profile"
    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
  />
) : <img
    src="https://res.cloudinary.com/dmbavexyg/image/upload/f_auto,q_auto,dpr_auto/v1756975176/askora_public/profilepic4.jpg"
    loading="lazy"
    alt="Profile"
    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
  />}

              </div>
              <div style={{ color: "white", marginTop: "30px" }}>
                <h1 style={{ fontSize: "17px", fontWeight: "500", margin: "0 0 10px 0" }}>
                  {user?.username || user?.name}
                </h1>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "400", color: "#8f8f8f", margin: 0 }}>
                    <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{followersCount || user?.stats?.followers || 0}</span> Followers
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: "400", color: "#8f8f8f", margin: 0 }}>
                    <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{followingCount || user?.stats?.following || 0}</span> Following
                  </p>
                </div>

                {/* Replace: Edit Profile (own) vs Follow (other) */}
                <div style={{ marginTop: "20px" }}>
                  {isOwnProfile ? (
                    <button
                      style={{ backgroundColor: "#6b21a8", color: "white", border: "1px solid #9333ea", borderRadius: "6px", padding: "10px 50px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s ease", outline: "none", lineHeight: "20px", whiteSpace: "nowrap", display: "inline-block", textAlign: "center" }}
                      onMouseEnter={(e) => { e.target.style.backgroundColor = "#9333ea"; e.target.style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { e.target.style.backgroundColor = "#6b21a8"; e.target.style.color = "white"; }}
                      onClick={handleProfileEditClick}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (followLoading) return;
                          if (isFollowing) {
                            unfollowUser(identifier || user?._id);
                          } else {
                            followUser(identifier || user?._id);
                          }
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: isFollowing ? '1px solid rgba(147,51,234,0.6)' : '1px solid rgba(255,255,255,0.06)',
                          backgroundColor: isFollowing ? 'rgba(147,51,234,0.12)' : 'transparent',
                          color: isFollowing ? '#e9d5ff' : '#ffffff',
                          cursor: followLoading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { if (!isFollowing) e.currentTarget.style.backgroundColor = 'rgba(147,51,234,0.08)'; }}
                        onMouseLeave={e => { if (!isFollowing) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title={isFollowing ? 'Unfollow' : 'Follow'}
                      >
                        {followLoading ? (isFollowing ? 'Unfollowing…' : 'Following…') : (isFollowing ? 'Following' : 'Follow')}
                      </button>

                      
                    </div>
                  )}
                </div>
              </div>
            </div>

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
{/* Progress Analytics */}
            <div className="progress-analytics">
              <h2 className="section-title">
                <FiTrendingUp /> Progress Analytics
              </h2>
              <div className="analytics-grid">
                <div className="analytics-card analytics-card-purple">
                  <div className="analytics-value analytics-value-purple">
                    <CountUp
                      from={0}
                      to={user?.stats?.totalPracticeHours || 0}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up4"
                    />
                  </div>
                  <div className="analytics-label">Practice Hours</div>
                  <div className="analytics-change">+12 this week</div>
                </div>
                <div className="analytics-card analytics-card-green">
                  <div className="analytics-value analytics-value-green">
                    <CountUp
                      from={0}
                      to={user?.stats?.problemsSolved || 0}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up4"
                    />
                  </div>
                  <div className="analytics-label">Problems Solved</div>
                  <div className="analytics-change">+15 this week</div>
                </div>
                <div className="analytics-card analytics-card-yellow">
                  <div className="analytics-value analytics-value-yellow">
                    <CountUp
                      from={0}
                      to={user?.stats?.mockInterviews || 0}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up4"
                    />
                  </div>
                  <div className="analytics-label">Mock Interviews</div>
                  <div className="analytics-change">+3 this week</div>
                </div>
                <div className="analytics-card analytics-card-red">
                  <div className="analytics-value analytics-value-red">
                    <CountUp
                      from={2000}
                      to={user?.stats?.globalRank || 2000}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up4"
                    />
                  </div>
                  <div className="analytics-label">Global Rank</div>
                  <div className="analytics-change">↗ 156 this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ height: "100%", width: "100%", borderRadius: "24px" }}>
            <div className="upperrightprof">
              <div className="profpicss">
                {user?.profilePicture ? (
  <img
    src={user.profilePicture}
    alt="Profile"
    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
  />
) : <img
    src="/profilepic4.png"
    alt="Profile"
    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
  /> }

              </div>

              {/* ABOUT SECTION */}
              <div className="aboutprof">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h1>About me</h1>

                  {/* Show Edit button only if it's your own profile and not currently editing */}
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
                    >
                      Edit
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
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "12px",
                        justifyContent: "flex-end",
                      }}
                    >
                      {/* Cancel */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTempAboutText(user?.aboutText || "");
                          setIsEditingAbout(false);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          color: "#9333ea",
                          border: "1px solid #9333ea",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Cancel
                      </button>

                      {/* Save */}
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!tempAboutText.trim()) {
                            alert("Please enter some text before saving.");
                            return;
                          }
                          try {
                            await updateAboutText(tempAboutText.trim());
                            setIsEditingAbout(false);
                          } catch (error) {
                            console.error("Error saving about text:", error);
                            alert("Failed to save. Please try again.");
                          }
                        }}
                        disabled={!tempAboutText.trim()}
                        style={{
                          backgroundColor: tempAboutText.trim() ? "#9333ea" : "#666",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "14px",
                          cursor: tempAboutText.trim() ? "pointer" : "not-allowed",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // About text (clickable only for own profile)
                  <div
                    style={{
                      cursor: isOwnProfile ? "pointer" : "default",
                      padding: "12px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      border: "1px solid transparent",
                      minHeight: "60px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                    }}
                    onClick={(e) => {
                      if (!isOwnProfile) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditingAbout(true);
                      setTempAboutText(user?.aboutText || "");
                    }}
                    onMouseEnter={(e) => {
                      if (isOwnProfile) {
                        e.target.style.backgroundColor = "rgba(147, 51, 234, 0.1)";
                        e.target.style.border =
                          "1px solid rgba(147, 51, 234, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isOwnProfile) {
                        e.target.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                        e.target.style.border = "1px solid transparent";
                      }
                    }}
                  >
                    <p style={{ margin: 0, color: user?.aboutText ? "#ffffff" : "#8f8f8f", lineHeight: "1.5", fontSize: "14px" }}>
                      {user?.aboutText && user.aboutText.trim() !== "" 
                        ? user.aboutText 
                        : (isOwnProfile ? "Click here to add information about yourself..." : DEFAULT_ABOUT)}
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
            {/* Interview Topics & Schedule Section */}
            <div className="topics-schedule-section">
              {/* Favorite Topics */}
              <div className="topics-panel">
                <h2 className="skills-title">
                  <FiBookOpen /> Favorite Topics
                </h2>
                <div className="topics-tags">
                  {interviewStats.favTopics.map((topic, index) => (
                    <span key={index} className="topic-tag">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upcoming Schedule */}
              <div className="schedule-panel">
                <h2 className="skills-title">
                  <FiCalendar /> Upcoming Events
                </h2>
                <div className="schedule-list">
                  <div className="schedule-item schedule-item-purple">
                    <FiClock className="schedule-icon schedule-icon-purple" />
                    <div>
                      <div className="schedule-title">System Design Mock</div>
                      <div className="schedule-time">Tomorrow, 2:00 PM</div>
                    </div>
                  </div>
                  <div className="schedule-item schedule-item-green">
                    <FiClock className="schedule-icon schedule-icon-green" />
                    <div>
                      <div className="schedule-title">Behavioral Interview</div>
                      <div className="schedule-time">Aug 12, 10:00 AM</div>
                    </div>
                  </div>
                  <div className="schedule-item schedule-item-yellow">
                    <FiClock className="schedule-icon schedule-icon-yellow" />
                    <div>
                      <div className="schedule-title">Coding Challenge</div>
                      <div className="schedule-time">Aug 15, 4:00 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

{/* Recently Attempted Interviews */}
<div className="recent-interviews-section">
  <h1 className="recent-interviews-title">
    {isOwnProfile ? "Recently Attempted Interviews" : "Recently Viewed Interviews"}
  </h1>

  <div className="interviews-grid">
    <h1 className="centertexts">Upcoming soon</h1>
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
  {/* hidden file input */}
  <input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    style={{ display: 'none' }}
    onChange={handleFileInputChange}
  />

  {/* clickable profile picture area */}
  <div
    className="profile-pic-large"
    onClick={() => {
      if (!isOwnProfile) return;
      triggerProfilePicSelect();
    }}
    style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
  >
    {user?.profilePicture ? ( 
      <img
        src={user.profilePicture}
        alt="Profile large"
        style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
      />
    ) : null}



    <button
      type="button"
      className="camera-btn"
      onClick={(e) => {
        e.stopPropagation();
        if (!isOwnProfile) return;
        triggerProfilePicSelect();
      }}
      title="Change profile picture"
    >
      <FiCamera size={12} />
    </button>
  </div>

  <p className="profile-pic-hint">Click to change profile picture</p>

  {uploading && (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontSize: '12px', color: '#ddd' }}>Uploading: {uploadProgress}%</div>
      <div style={{ width: '100%', height: '6px', background: '#2a2a2a', borderRadius: 4, marginTop: 6 }}>
        <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#9333ea', borderRadius: 4 }} />
      </div>
    </div>
  )}
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

// src/pages/ViewProfile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ProfileCard from '../components/ProfileCard';
import './ViewProfile.css';
import Dock from '../react-bits/Dock';
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const ViewProfile = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to get current user id if token exists
        let ownId = null;
        const token = localStorage.getItem('token');

        if (token) {
          try {
            const pRes = await fetch(`${API_BASE}/api/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (pRes.ok) {
              const pData = await pRes.json();
              // server returns user doc; ensure _id present
              ownId = pData?._id || pData?.id || null;
            } else {
              // If token invalid/expired, ignore and proceed without excluding anyone
              console.warn('Could not fetch profile to determine own id (status)', pRes.status);
            }
          } catch (err) {
            console.warn('Error fetching own profile (will not exclude):', err);
          }
        }

        // Fetch users list
        const res = await fetch(`${API_BASE}/api/users`);
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];

        // If ownId found, filter it out
        const filtered = ownId ? arr.filter(u => String(u._id) !== String(ownId)) : arr;

        if (mounted) setUsers(filtered);
      } catch (err) {
        console.error('Error fetching users list:', err);
        if (mounted) setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, []);

  // search & filter
  const filteredProfiles = useMemo(() => {
    const trimmed = (searchTerm || '').trim();
    if (!trimmed) return users;
    const q = trimmed.toLowerCase();
    return users.filter(u => {
      const name = u.name || '';
      const username = u.username || '';
      const company = u.company || '';
      const topics = Array.isArray(u.favoriteTopics) ? u.favoriteTopics.join(' ') : '';
      return (
        name.toLowerCase().includes(q) ||
        username.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        topics.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, users]);

  const items = [
    { icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />, label: "Home", onClick: () => navigate('/Dashboard') },
    { icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />, label: "Interviews", onClick: () => navigate('/Interview') },
    { icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />, label: "Create", onClick: () => navigate('/Create') },
    { icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />, label: "Saves", onClick: () => navigate('/Saves') },
    { icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />, label: "Profile", onClick: () => navigate('/Profile') },
    { icon: <img src="/ViewProfile.png" alt="Explore" style={{ width: '48px', height: '48px' }} />, label: "Explore", onClick: () => navigate('/ViewProfile') }
  ];

  return (
    <div className="view-profile-page-wrapper">
      <div className="dashboard-bg-orbs">
        <div className="dashboard-orb dashboard-orb1"></div>
        <div className="dashboard-orb dashboard-orb2"></div>
        <div className="dashboard-orb dashboard-orb3"></div>
        <div className="dashboard-orb dashboard-orb4"></div>
        <div className="dashboard-orb dashboard-orb5"></div>
      </div>

      <div className="search-page">
        <div className="page-header">
          <div className="logo-containernew">
            <span className="logonew">Askora</span>
          </div>
        </div>

        <div className="page-content">
          <div className="search-container">
            <div className="search-wrapper">
              <div className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by username, name, company or topics"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="profiles-grid">
            {loading ? (
              <div style={{ padding: 24 }}>Loading users…</div>
            ) : filteredProfiles && filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile, idx) => (
                <ProfileCard key={profile._id || `${profile.name}-${idx}`} profile={profile} />
              ))
            ) : (
              <div className="no-results">
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        <Dock
          items={items}
          panelHeight={78}
          baseItemSize={60}
          magnification={80}
        />
      </div>
    </div>
  );
};

export default ViewProfile;

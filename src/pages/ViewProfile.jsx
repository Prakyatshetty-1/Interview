import React, { useState, useMemo } from 'react';
import ProfileCard from '../components/ProfileCard';
import './ViewProfile.css';
import Dock from '../react-bits/Dock';

const ViewProfile = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for multiple profiles with more variety for better search testing
  const profiles = [
    {
      id: 1,
      name: "Lia Hartwell",
      title: "Middle Graphic Designer",
      rating: 4.9,
      earned: "$12K",
      rate: "$35/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    },
    {
      id: 2,
      name: "Alex Johnson",
      title: "Senior UI/UX Designer",
      rating: 4.8,
      earned: "$18K",
      rate: "$45/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    },
    {
      id: 3,
      name: "Sarah Chen",
      title: "Frontend Developer",
      rating: 4.7,
      earned: "$22K",
      rate: "$50/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: false
    },
    {
      id: 4,
      name: "Mike Rodriguez",
      title: "Brand Designer",
      rating: 4.9,
      earned: "$15K",
      rate: "$40/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    },
    {
      id: 5,
      name: "Emma Wilson",
      title: "Motion Graphics Designer",
      rating: 4.6,
      earned: "$20K",
      rate: "$55/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    },
    {
      id: 6,
      name: "Lia Hartwell",
      title: "Middle Graphic Designer",
      rating: 4.9,
      earned: "$12K",
      rate: "$35/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    },
    {
      id: 7,
      name: "Alex Johnson",
      title: "Senior UI/UX Designer",
      rating: 4.8,
      earned: "$18K",
      rate: "$45/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    },
    {
      id: 8,
      name: "Sarah Chen",
      title: "Frontend Developer",
      rating: 4.7,
      earned: "$22K",
      rate: "$50/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: false
    },
    {
      id: 9,
      name: "Mike Rodriguez",
      title: "Brand Designer",
      rating: 4.9,
      earned: "$15K",
      rate: "$40/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    },
    {
      id: 10,
      name: "Emma Wilson",
      title: "Motion Graphics Designer",
      rating: 4.6,
      earned: "$20K",
      rate: "$55/hr",
      image: "/placeholder.svg?height=60&width=60",
      isOnline: true
    }
  ];

  // Filter profiles based on search term
  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) {
      return profiles;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return profiles.filter(profile => 
      profile.name.toLowerCase().includes(searchLower) ||
      profile.title.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, profiles]);
   const items = [
    {
      icon: <img src="/homeicon.png" alt="Home" style={{ width: '48px', height: '48px' }} />,
      label: "Home",
      onClick: () => alert("Home!"),
    },
    {
      icon: <img src="/interviewicon.png" alt="Interviews" style={{ width: '48px', height: '48px' }} />,
      label: "Interviews",
      onClick: () => alert("Interviews!"),
    },
    {
      icon: <img src="/createicon.png" alt="Create" style={{ width: '48px', height: '48px' }} />,
      label: "Create",
      onClick: () => alert("Create!"),
    },
    {
      icon: <img src="/favicon.png" alt="Saves" style={{ width: '48px', height: '48px' }} />,
      label: "Saves",
      onClick: () => alert("Saves!"),
    },
    
    {
      icon: <img src="/profileicon.png" alt="Profile" style={{ width: '48px', height: '48px' }} />,
      label: "Profile",
      onClick: () => alert("Profile!"),
    },
  
    {
      icon: <img src="/settingsicon.png" alt="Settings"style={{ width: '48px', height: '48px' }} />,
      label: "Settings",
      onClick: () => alert("Settings!"),
    },
  ];


  return (
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
              placeholder="Search by username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="profiles-grid">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))
          ) : (
            <div className="no-results">
              No designers found matching "{searchTerm}"
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
  );
};

export default ViewProfile;
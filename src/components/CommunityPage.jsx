"use client"

import { useState, useEffect } from "react"
import "./CommunityPage.css"

const communityMembers = [
  {
    id: 1,
    name: "Fatima Ameen",
    handle: "@fatima",
    title: "Senior Product Designer at Shopify",
    location: "Toronto, Canada",
    avatar: "/profilepic1.png",
    skills: ["Figma", "Sketch", "Prototyping"],
    isOnline: true,
  },
  {
    id: 2,
    name: "Ekene Smart",
    handle: "@smartofux",
    title: "UX Designer & Engineer at Shopify",
    location: "Lagos, Nigeria",
    avatar: "/placeholder.svg?height=60&width=60&text=ES",
    skills: ["Figma", "Javascript", "React Native"],
    isOnline: true,
  },
  {
    id: 3,
    name: "Femi John",
    handle: "@thefemijohn",
    title: "Product Design Lead @lifechangeNG",
    location: "Abuja, Nigeria",
    avatar: "/placeholder.svg?height=60&width=60&text=FJ",
    skills: ["Figma", "Photoshop", "Illustrator"],
    isOnline: false,
  },
  {
    id: 4,
    name: "David Martinez",
    handle: "@davidmtz",
    title: "Full Stack Developer at Meta",
    location: "San Francisco, USA",
    avatar: "/placeholder.svg?height=60&width=60&text=DM",
    skills: ["React", "Node.js", "TypeScript"],
    isOnline: true,
  },
]

const creativeTypes = ["Illustrators", "Bloggers", "Animators", "Developers", "Designers", "Writers"]

// SVG Icons
const UserIcon = () => (
  <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)

const LogoIcon = () => (
  <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

export default function CommunityPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedCards, setLoadedCards] = useState([])

  useEffect(() => {
    setIsLoaded(true)
    communityMembers.forEach((_, index) => {
      setTimeout(() => {
        setLoadedCards((prev) => [...prev, index])
      }, index * 200)
    })
  }, [])

  return (
    <div className="community-page">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="bg-blur-1"></div>
        <div className="bg-blur-2"></div>
        <div className="bg-blur-3"></div>
        <div className="bg-blur-4"></div>
        
      </div>

      <div className={`main-content ${isLoaded ? "loaded" : ""}`}>
        <div className="content-container">
          {/* Left Side - Hero Section */}
          <div className="hero-section">
            <h1 className="hero-title">
              Contribute.
              <br />
              Share.
              <br />
              Collaborate.
            </h1>
            <p className="hero-description">
              Share your works, connect with employers, and socialize with other creatives. We are the social networking
              platform for global talents.
            </p>
            <div className="hero-buttons">
              <button className="get-started-btn">Get Started</button>
              <button className="log-in-btn">Log In</button>
            </div>
          </div>

          {/* Right Side - Community Cards */}
          <div className="community-section">
            <div className="community-cards">
              {communityMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`member-card ${loadedCards.includes(index) ? "loaded" : ""}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="member-header">
                    <div className="member-avatar">
                      <UserIcon />
                      {member.isOnline && <div className="online-indicator"></div>}
                    </div>
                    <div className="member-info">
                      <div className="member-name-row">
                        <h3 className="member-name">{member.name}</h3>
                        <span className="member-handle">{member.handle}</span>
                      </div>
                      <p className="member-title">{member.title}</p>
                      
                      <div className="member-skills">
                    {member.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    </div>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <h2 className="bottom-title">BUILT FOR ALL TYPES OF DIGITAL CREATIVES</h2>
          <div className="creative-types">
            {creativeTypes.map((type, index) => (
              <span key={index} className="creative-type">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
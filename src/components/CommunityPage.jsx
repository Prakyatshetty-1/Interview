"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import ScrollFloat from "../react-bits/ScrollFloat"
import { useNavigate } from "react-router-dom"
import "./CommunityPage.css"


gsap.registerPlugin(ScrollTrigger)

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

const UserIcon = () => (
  <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

export default function CommunityPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedCards, setLoadedCards] = useState([])
  const cardRefs = useRef([])
  const containerRef = useRef(null)

  useEffect(() => {
    setIsLoaded(true)

    communityMembers.forEach((_, index) => {
      setTimeout(() => {
        setLoadedCards((prev) => [...prev, index])
      }, index * 200)
    })

    setTimeout(() => {
      setupStackAnimation()
    }, 1000)

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])


  const setupStackAnimation = () => {
  cardRefs.current.forEach((card, index) => {
    if (!card) return

    gsap.set(card, {
      position: "absolute",
      top: 100,
      left: 0,
      x: 0,
      y: 0,
      scale: 1,
      width: "100%",
      opacity: 1,
      filter: "blur(0px)",
      transform: "none",
      zIndex: 10 - index,
    })

    if (index === 1) {
      gsap.set(card, { zIndex: 100 }) // Ekene on top
      return
    }

    let toVars = {}
    if (index === 0) {
      toVars = {
        y: -160,
        x: 40,
        width: "85%",
        opacity: 0.5,
        scale: 0.95,
        filter: "blur(2px)",
      }
    } else if (index === 2) {
      toVars = {
        y: 160,
        x: 40,
        width: "92%",
        opacity: 0.7,
        scale: 0.97,
        filter: "blur(1.5px)",
      }
    } else if (index === 3) {
      toVars = {
        y: 320,
        x: 60,
        width: "80%",
        opacity: 0.4,
        scale: 0.92,
        filter: "blur(3px)",
      }
    }

    gsap.to(card, {
      ...toVars,
      scrollTrigger: {
        trigger: ".community-cards",
        start: "top 85%",
        end: "top 35%",
        scrub: true,
      },
      duration: 0.5,
      ease: "power3.out",
    })
  })
}

  const navigate=useNavigate();
  const handleGetStarted = () => navigate('/signup')
  const handleLogin = () => navigate('/login')


  return (
    <div className="community-page">
      <div className="background-elements">
        <div className="bg-blur-1"></div>
        <div className="bg-blur-2"></div>
        <div className="bg-blur-3"></div>
        <div className="bg-blur-4"></div>
      </div>

      <div className={`main-content ${isLoaded ? "loaded" : ""}`}>
        <div className="content-container">
          <div className="hero-section">
              <ScrollFloat
              animationDuration={1}
              ease='back.inOut(2)'
              scrollStart='center bottom+=20%'
              scrollEnd='bottom bottom-=50%'
              stagger={0.03}
              textClassName="hero-title"
            >
              Contribute.
              <br />
              Share.
              <br />
              Collaborate.
            </ScrollFloat>
            <p className="hero-description">
              Share your works, connect with employers, and socialize with other creatives. We are the social networking
              platform for global talents.
            </p>
            <div className="hero-buttons">

              <button className="get-started-btn" onClick={handleGetStarted}>
                Get Started
              </button>
              <button className="log-in-btn" onClick={handleLogin}>
                Log In
              </button>

            </div>
          </div>

          <div className="community-section">
            <div className="community-cards" ref={containerRef} style={{ position: "relative", minHeight: "500px" }}>
              {communityMembers.map((member, index) => (
                <div
                  key={member.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className={`member-card ${loadedCards.includes(index) ? "loaded" : ""} ${index === 1 ? "ekene-card" : ""}`}
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
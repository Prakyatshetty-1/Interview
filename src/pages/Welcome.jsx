"use client"

import { useState, useEffect } from "react"
import "./Welcome.css"
import Dashboard from "./Dashboard"

const Welcome = () => {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showDashboard, setShowDashboard] = useState(false)
  const [typingComplete, setTypingComplete] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [particlesConverging, setParticlesConverging] = useState(false)
  const [showBlast, setShowBlast] = useState(false)

  useEffect(() => {
    if (typingComplete) {
      // Show particles after typing completes (they will appear one by one)
      const showParticlesTimer = setTimeout(() => {
        setShowParticles(true)
      }, 1000)

      // Start particle convergence after all particles have appeared (2.2s + 1s buffer)
      const convergeTimer = setTimeout(() => {
        setParticlesConverging(true)
      }, 4200)

      // Show blast effect at circle center after particles converge
      const blastTimer = setTimeout(() => {
        setShowBlast(true)
      }, 6000)

      // Hide welcome screen after blast
      const fadeOutTimer = setTimeout(() => {
        setShowWelcome(false)
      }, 6700)

      // Show dashboard
      const showDashboardTimer = setTimeout(() => {
        setShowDashboard(true)
      }, 7000)

      return () => {
        clearTimeout(showParticlesTimer)
        clearTimeout(convergeTimer)
        clearTimeout(blastTimer)
        clearTimeout(fadeOutTimer)
        clearTimeout(showDashboardTimer)
      }
    }
  }, [typingComplete])

  return (
    <div className="app">
      {showWelcome && (
        <div className={`welcome-container ${showBlast ? "blast-fade" : ""}`}>
          <div className="circle-container">
            <div className={`glowing-circle ${typingComplete ? "complete" : ""}`}></div>
            <TypingText text="WELCOME TO ASKORA" onComplete={() => setTypingComplete(true)} />

            {showBlast && (
              <div className="blast-effect">
                <div className="blast-core"></div>
                <div className="blast-ring-1"></div>
                <div className="blast-ring-2"></div>
                <div className="blast-ring-3"></div>
              </div>
            )}
          </div>

          {showParticles && (
            <div className={`particles-container ${particlesConverging ? "converging" : ""}`}>
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className={`particle particle-${index + 1}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {showDashboard && (
        <div className="dashboard-container fade-in">
          <Dashboard />
        </div>
      )}
    </div>
  )
}

const TypingText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 150)

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true)
      if (onComplete) {
        setTimeout(() => {
          onComplete()
        }, 800)
      }
    }
  }, [currentIndex, text, onComplete, isComplete])

  return (
    <div className="typing-container">
      <h1 className={`typing-text ${isComplete ? "complete" : ""}`}>
        {displayedText}
        {!isComplete && <span className="cursor">|</span>}
      </h1>
    </div>
  )
}

export default Welcome

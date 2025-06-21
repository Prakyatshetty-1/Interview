"use client"

import { useState, useEffect } from "react"
import "./Welcome.css"
import Dashboard from "./Dashboard"

const Welcome = () => {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showDashboard, setShowDashboard] = useState(false)
  const [typingComplete, setTypingComplete] = useState(false)

  useEffect(() => {
    if (typingComplete) {
      // Start fade out after completion animation
      const fadeOutTimer = setTimeout(() => {
        setShowWelcome(false)
      }, 1200)

      // Start dashboard fade in
      const showDashboardTimer = setTimeout(() => {
        setShowDashboard(true)
      }, 1800)

      return () => {
        clearTimeout(fadeOutTimer)
        clearTimeout(showDashboardTimer)
      }
    }
  }, [typingComplete])

  return (
    <div className="app">
      {showWelcome && (
        <div className={`welcome-container ${typingComplete ? "fade-out" : ""}`}>
          <div className="circle-container">
            <div className={`glowing-circle ${typingComplete ? "complete" : ""}`}></div>
            <TypingText text="WELCOME TO ASKORA" onComplete={() => setTypingComplete(true)} />
          </div>
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
        }, 800) // Pause to show completed text
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

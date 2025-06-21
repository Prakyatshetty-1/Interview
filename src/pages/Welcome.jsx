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
      // Start fade out immediately when typing completes
      const fadeOutTimer = setTimeout(() => {
        setShowWelcome(false)
      }, 500) // Small delay to let user see completed text

      // Start dashboard fade in as welcome fades out
      const showDashboardTimer = setTimeout(() => {
        setShowDashboard(true)
      }, 800) // Slight overlap for smoother transition

      return () => {
        clearTimeout(fadeOutTimer)
        clearTimeout(showDashboardTimer)
      }
    }
  }, [typingComplete])

  return (
    <div className="app">
      {showWelcome && (
        <div className={`welcome-container ${!showWelcome ? "fade-out" : ""}`}>
          <TypingText text="WELCOME TO ASKORA" onComplete={() => setTypingComplete(true)} />
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

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 150) // Typing speed

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && onComplete) {
      // Typing is complete, notify parent component
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  return (
    <div className="typing-container">
      <h1 className="typing-text">
        {displayedText}
        <span className="cursor">|</span>
      </h1>
    </div>
  )
}

export default Welcome

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
      // Start fade out after a brief pause to show completed text
      const fadeOutTimer = setTimeout(() => {
        setShowWelcome(false)
      }, 1000) // Increased delay to let the text completion animation play

      // Start dashboard fade in with better timing
      const showDashboardTimer = setTimeout(() => {
        setShowDashboard(true)
      }, 1500) // Adjusted timing for smoother transition

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
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 150) // Typing speed

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && !isComplete) {
      // Typing is complete, trigger completion animation
      setIsComplete(true)
      if (onComplete) {
        setTimeout(() => {
          onComplete()
        }, 50) // Small delay before starting exit animation
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

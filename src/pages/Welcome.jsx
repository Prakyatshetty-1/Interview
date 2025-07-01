"use client"

import { useState, useEffect } from "react"
import Dashboard from "./Dashboard"
import BlurText from "../react-bits/BlurText"
import "./Welcome.css"

function Welcome() {
    const [showWelcome, setShowWelcome] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        // Start fade out after 2 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, 2000)

        // Hide welcome screen after fade animation completes
        const hideTimer = setTimeout(() => {
            setShowWelcome(false)
        }, 3000) // 2s delay + 1s fade duration

        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(hideTimer)
        }
    }, [])

    if (!showWelcome) {
        return <Dashboard />
    }

    return (
        <>
            <div className={`welcome-screen6 ${fadeOut ? "fade-out6" : ""}`}>
                <BlurText
                    text="WELCOME TO ASKORA"
                    delay={150}
                    animateBy="words"
                    direction="top"
                    className="welcome-text6"
                />
            </div>
            {fadeOut && (
                <div className="dashboard-container6">
                    <Dashboard />
                </div>
            )}
        </>
    )
}

export default Welcome

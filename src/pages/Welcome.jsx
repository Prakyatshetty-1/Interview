"use client"
import { useState, useEffect } from "react"
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import * as reactSpringThree from '@react-spring/three'
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
                <ShaderGradientCanvas
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: -1
                    }}
                >
                    <ShaderGradient
                        control='query'
                        urlString='https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=3&cPolarAngle=90&cameraZoom=1&color1=%230d0d0d&color2=%234c1d95&color3=%23a855f7&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=5&gizmoHelper=hide&grain=off&lightType=env&pixelDensity=0.8&positionX=-1.4&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=waterPlane&uDensity=1.2&uFrequency=4&uSpeed=0.15&uStrength=1.3&uTime=0&wireframe=false'
                    />
                </ShaderGradientCanvas>
                <BlurText
                    text="WELCOME TO ASKORA"
                    delay={250}
                    animateBy="words"
                    direction="bottom"
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
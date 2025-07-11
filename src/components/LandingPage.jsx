
"use client"

import "./LandingPage.css"
import { useEffect, useState } from "react" // CHANGE: Added useState import
import { useNavigate } from "react-router-dom"


function LandingPage() {
  // CHANGE: Added state to control fade-in effect
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://unpkg.com/@splinetool/viewer@1.10.2/build/spline-viewer.js"
    script.type = "module"
    document.body.appendChild(script)

    // Ensure the spline viewer covers full screen after loading
    const handleSplineLoad = () => {
      const splineViewer = document.querySelector("spline-viewer")
      if (splineViewer) {
        splineViewer.style.width = "100vw"
        splineViewer.style.height = "100vh"
        splineViewer.style.position = "absolute"
        splineViewer.style.top = "0"
        splineViewer.style.left = "0"
        splineViewer.style.margin = "0"
        splineViewer.style.padding = "0"
      }
    }


    // Wait for the script to load and then apply styles
    script.onload = () => {
      setTimeout(handleSplineLoad, 100)
    }

    // CHANGE: Trigger fade-in effect after component mounts
    const fadeInTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 100) // Small delay to ensure smooth transition

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      // CHANGE: Clean up the fade-in timer
      clearTimeout(fadeInTimer)
    }
  }, [])

  const navigate = useNavigate()


  return (
    // CHANGE: Added conditional class for fade-in effect
    <div className={`landing-container ${isLoaded ? "fade-in" : "fade-out"}`}>
      {/* Spline Viewer - Place it first so it's in the background */}
      <div className="spline-container">
        <spline-viewer
          url="https://prod.spline.design/86DzIrVjpQ1YoHMi/scene.splinecode"
          loading="eager"
          style={{
            width: "100vw",
            height: "100vh",
            position: "absolute",
            top: "0",
            left: "0",
            margin: "0",
            padding: "0",
          }}
        />
      </div>

      {/* Content on top */}
      <div className="content-wrapper">
        <h1 className="main-heading">
          <span className="heading-line">Master Through</span><br />
                    <span className="heading-line">Askora</span>
        </h1>

        <p className="sub-text">
          Experience AI-driven interview simulations with lifelike voice interactions
          <br />
          and real questions shared by a global community of learners.
          <br />
          Practice smart. Perform better.
        </p>


        <div className="button-group">
          <button className="primary-button" onClick={() => navigate("/signup")}>
            GET STARTED &rarr;
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              document.getElementById("pricing").scrollIntoView({ behavior: "smooth" })
            }}
          >
            PRICING
          </button>
        </div>
      </div>

      {/* Hide Spline watermark */}
      <div className="boxhide"></div>
    </div>
  )
}

export default LandingPage
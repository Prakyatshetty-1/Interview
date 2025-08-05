"use client"

import { useState, useEffect } from "react"
import ScrollFloat from "../react-bits/ScrollFloat"
import "./Features.css"

export default function Features() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={`gradient-grid ${isLoaded ? "loaded" : ""}`}>
      <div className="pricing-bg-orbss">
        <div className="pricing-orbb pricing-orbs1"></div>

      </div>
      <ScrollFloat
        animationDuration={1}
        ease='back.inOut(2)'
        scrollStart='center bottom+=10%'
        scrollEnd='bottom bottom-=60%'
        stagger={0.03}
        textClassName="title"
      >
        Key Features of Askora
      </ScrollFloat>
      <div className="grid-container">
        {/* Top left block */}
        <div className="grid-item top-left">
          <div className="content">
            <div className="text-container horizontal">
              <div className="text primary">
                <h1>Webflow Development</h1>
                <p>Create stunning, responsive websites that engage your audience and drive results.</p>
              </div>
              <div className="textboxmiddletext">
                <h1>digital</h1>
                <div className="verticalline"></div>
                </div>
              <div className="textboxbottomtext">
                <h1>ex<span className="textpurple">periences.</span></h1>
              </div>
            </div>
            <div className="rocketbox">
              <div className="ubox">
                <h1 className="uptext">Best</h1>
                <h1 className="dntext">The Plan</h1>
              </div>
              <img src="./features1.png"/>
            </div>
          </div>
          <div className="bottomotherfeaturebox">
            <div className="bottomotherboxouter">
              <div className="bottomboxouter1">
                  <h1>Experience Smooth UI</h1>
                  <div className="glare"></div>
                <div className="mockup"></div>
              </div>
              <div className="bottomboxouter2">
                <div className="bottomboxbox"></div>
                <img src="/star.png"></img>
                <h1>All around<br/> the globe</h1>
                <p>500 clients accross <br/> 15 countries</p>
                <div className="bottomboxcircle1"></div>
                <div className="bottomboxcircle2"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}
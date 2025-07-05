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
              <div className="text secondary right-align">
                Professional web solutions tailored to your business needs and goals.
              </div>
            </div>
          </div>
        </div>

        {/* Top right block */}
        <div className="grid-item top-right">
          <div className="content">
            <div className="text-container vertical">
              <div className="text primary">
                <h1>MOBILE APPS</h1>
                <p>Build powerful mobile applications that connect with users on any device.</p>
              </div>
              <div className="text secondary">Native and cross-platform solutions for iOS and Android.</div>
            </div>
          </div>
        </div>

        {/* Bottom left block */}
        <div className="grid-item bottom-left">
          <div className="content">
            <div className="text-container vertical">
              <div className="text primary">
                <h1>UI/UX DESIGN</h1>
                <p>Design beautiful interfaces that provide exceptional user experiences.</p>
              </div>
              <div className="text secondary">User-centered design that converts visitors into customers.</div>
            </div>
          </div>
        </div>

        {/* Middle block (blue accent) */}
        <div className="grid-item middle">
          <div className="content">
            <div className="text-container vertical">
              <div className="text primary">
                <p>Strategic guidance for your digital transformation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom right block */}
        <div className="grid-item bottom-right">
          <div className="content">
            <div className="text-container horizontal">
              <div className="text primary">
                <h1>E-COMMERCE</h1>
                <p>Build powerful online stores that drive sales and grow your business.</p>
              </div>
              <div className="text secondary right-align">
                Complete e-commerce solutions with secure payment processing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
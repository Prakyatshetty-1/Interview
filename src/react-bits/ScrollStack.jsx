"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import "./ScrollStack.css"
import ScrollFloat from "../react-bits/ScrollFloat"

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function Pricing() {
  const basicCardRef = useRef(null)
  const enterpriseCardRef = useRef(null)
  const popularCardRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const basicCard = basicCardRef.current
    const enterpriseCard = enterpriseCardRef.current
    const popularCard = popularCardRef.current
    const section = sectionRef.current

    if (!basicCard || !enterpriseCard || !popularCard || !section) return

    // Get the natural positions of the cards in the grid
    const basicRect = basicCard.getBoundingClientRect()
    const enterpriseRect = enterpriseCard.getBoundingClientRect()
    const popularRect = popularCard.getBoundingClientRect()

    // Calculate the distance each card needs to move to center behind popular card
    const basicOffset = popularRect.left - basicRect.left
    const enterpriseOffset = popularRect.left - enterpriseRect.left

    // Set initial positions - move cards to center behind popular card
    gsap.set(basicCard, {
      x: basicOffset,
      scale: 0.9,
      opacity: 0.1,
      zIndex: 1,
    })

    gsap.set(enterpriseCard, {
      x: enterpriseOffset,
      scale: 0.9,
      opacity: 0.1,
      zIndex: 1,
    })

    gsap.set(popularCard, {
      zIndex: 10,
      scale: 1.05,
      opacity: 1,
    })

    // Create scroll-triggered animation to move cards back to their natural positions
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "top+=200px center", // Much shorter scroll distance for faster completion
      scrub: 0.1, // Changed from 0.3 to 0.1 for ultra-fast animation
      onUpdate: (self) => {
        const progress = self.progress

        // Animate basic card back to its natural position
        gsap.to(basicCard, {
          x: basicOffset * (1 - progress),
          scale: 0.9 + 0.1 * progress,
          opacity: 0.1 + 0.9 * progress,
          duration: 0.02, // Reduced from 0.05 to 0.02 for instant movement
          ease: "power4.out", // Even sharper easing
        })

        // Animate enterprise card back to its natural position
        gsap.to(enterpriseCard, {
          x: enterpriseOffset * (1 - progress),
          scale: 0.9 + 0.1 * progress,
          opacity: 0.1 + 0.9 * progress,
          duration: 0.02, // Reduced from 0.05 to 0.02 for instant movement
          ease: "power4.out", // Even sharper easing
        })
      },
    })

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="pricing-section">
      {/* Animated Background Elements - Only for this section */}
      <div className="pricing-bg-orbs">
        <div className="pricing-or1 pricing-orb1"></div>
        <div className="pricing-orb pricing-orb2"></div>
        <div className="pricing-orb pricing-orb3"></div>
        <div className="pricing-orb pricing-orb4"></div>
        <div className="pricing-orb pricing-orb5"></div>
      </div>

      {/* Geometric Grid Pattern */}
      <div className="pricing-bg-grid"></div>

      {/* Floating Particles */}
      <div className="pricing-particles">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="pricing-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container">
        <div className="header">
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=10%"
            scrollEnd="bottom bottom-=60%"
            stagger={0.09}
            textClassName="title"
          >
            A plan for every need
          </ScrollFloat>

          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=10%"
            scrollEnd="bottom bottom-=60%"
            stagger={0.03}
            textClassName="subtitle1"
          >
            Satisfy leads, start & become digital success with top-tier security.
          </ScrollFloat>
        </div>

        <div className="pricing-grid">
          {/* Basic Plan */}
          <div ref={basicCardRef} className="pricing-card basic-card">
            <div className="upper">
              <div className="card-header">
                <h3 className="plan-name">Basic plan</h3>
                <div className="price-container">
                  <span className="price">Free</span>
                  <span className="period">per month</span>
                </div>
                <p className="plan-description">For casual practice and job prep.</p>
              </div>
              <button className="cta-button1">Get started</button>
            </div>

            <div className="features">
              <h4 className="features-title">FEATURES</h4>
              <p className="features-subtitle">Everything you need to get started:</p>
              <ul className="features-list">
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Community packs access
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Limited AI interviews
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Create 1 custom 3-question pack
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Default AI voice
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Save up to 5 answers
                </li>
              </ul>
            </div>
          </div>

          {/* Business Plan - Popular */}
          <div ref={popularCardRef} className="pricing-card popular-card">
            <div className="upper">
              <div className="popular-badge">
                <span>Pro Plan</span>
                <span className="popular-label">Popular</span>
              </div>

              <div className="sparkles">
                <div className="sparkle" style={{ top: "25%", right: "20%" }}></div>
                <div className="sparkle" style={{ top: "45%", right: "15%" }}></div>
                <div className="sparkle" style={{ top: "35%", right: "25%" }}></div>
              </div>

              <div className="card-header">
                <div className="price-container">
                  <span className="price">$4</span>
                  <span className="period">per month</span>
                </div>
                <p className="plan-description">For active job seekers</p>
              </div>

              <button className="cta-button1 popular-button1">Get started</button>
            </div>

            <div className="features">
              <h4 className="features-title">FEATURES</h4>
              <p className="features-subtitle">Everything in our Basic plan plus...</p>
              <ul className="features-list">
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Unlimited AI interview sessions
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Build 10 custom sets
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Choose from 5 AI voices
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Smart answer insights
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Save and review unlimited answers
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div ref={enterpriseCardRef} className="pricing-card enterprise-card">
            <div className="upper">
              <div className="card-header">
                <h3 className="plan-name">Enterprise plan</h3>
                <div className="price-container">
                  <span className="price">$10</span>
                  <span className="period">per month</span>
                </div>
                <p className="plan-description">For recruiters and coaches</p>
              </div>
              <button className="cta-button1">Get started</button>
            </div>

            <div className="features">
              <h4 className="features-title">FEATURES</h4>
              <p className="features-subtitle">Everything in our Pro plan plus…</p>
              <ul className="features-list">
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Unlimited question pack creation
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Custom AI voice and persona
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Advanced analytics dashboard
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Early access to new feature
                </li>
                <li className="feature-item">
                  <span className="checkmark">✓</span>
                  Monetize your question packs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

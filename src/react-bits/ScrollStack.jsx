"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import './ScrollStack.css'
import ScrollFloat from "./ScrollFloat"
gsap.registerPlugin(ScrollTrigger)

export default function PricingPage() {
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

    gsap.set([basicCard, enterpriseCard, popularCard], {
      clearProps: "all",
      willChange: "transform, opacity", // 🚀 Hint GPU to optimize performance
    })

    const initAnimation = () => {
      const basicRect = basicCard.getBoundingClientRect()
      const enterpriseRect = enterpriseCard.getBoundingClientRect()
      const popularRect = popularCard.getBoundingClientRect()

      const basicMoveX = popularRect.left - basicRect.left
      const enterpriseMoveX = popularRect.left - enterpriseRect.left

      // 🧹 Remove per-frame zIndex updates to avoid layout thrashing
      gsap.set(basicCard, { zIndex: 0 })
      gsap.set(enterpriseCard, { zIndex: 0 })
      gsap.set(popularCard, { zIndex: 10 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "top+=400px center",
          scrub: 0.35, // 🎯 Reduced scrub time for responsiveness
        },
      })

      tl.set(basicCard, {
        x: basicMoveX,
        y: 0,
        scale: 0.92,
        opacity: 0,
      })
        .set(enterpriseCard, {
          x: enterpriseMoveX,
          y: 0,
          scale: 0.92,
          opacity: 0,
        }, 0)
        .set(popularCard, {
          x: 0,
          y: 0,
          scale: 1.05,
          opacity: 1,
        }, 0)

        // 🧊 Use power3.out easing for smooth motion
        .to(basicCard, {
          x: 0,
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
        })
        .to(enterpriseCard, {
          x: 0,
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
        }, 0)
        .to(popularCard, {
          scale: 1.05,
          duration: 1.2,
          ease: "power3.out",
        }, 0)

      section.classList.add("gsap-initialized")
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(initAnimation)
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      section.classList.remove("gsap-initialized")
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

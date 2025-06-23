import "./PricingPage.css"
import ScrollFloat from "../react-bits/ScrollFloat"

export default function Pricing() {
  return (
    <section className="pricing-section">
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
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container">
        <div className="header">
            <ScrollFloat
              animationDuration={1}
              ease='back.inOut(2)'
              scrollStart='center bottom+=10%'
              scrollEnd='bottom bottom-=60%'
              stagger={0.09}
              textClassName="title"
            >
              A plan for every need
            </ScrollFloat>

            <ScrollFloat
              animationDuration={1}
              ease='back.inOut(2)'
              scrollStart='center bottom+=10%'
              scrollEnd='bottom bottom-=60%'
              stagger={0.03}
              textClassName="subtitle1"
            >
              Satisfy leads, start & become digital success with top-tier security.
            </ScrollFloat>

          {/* <p className="subtitle1">Satisfy leads, start & become digital success with top-tier security.</p> */}
        </div>

        <div className="pricing-grid">
          {/* Basic Plan */}
          <div className="pricing-card">
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
          <div className="pricing-card popular-card">
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
          <div className="pricing-card">
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
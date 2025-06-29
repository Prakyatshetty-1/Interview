import "./HeroSection.css"
import { useNavigate } from "react-router-dom";

export default function HeroSection() {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/signup');
  };
  return (
    <div className="hero-page">
      {/* Hero Section */}
      <div className="herosec">
        <div className="hero-container">
          {/* Left semicircle arc */}
          <div className="decoration-left">
            <svg width="200" height="300" viewBox="0 0 200 300" className="arc-svg">
              <defs>
              <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
                <stop offset="10%" stopColor="rgba(139, 92, 246, 0.3)" />
                <stop offset="25%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="75%" stopColor="#7c3aed" />
                <stop offset="90%" stopColor="rgba(124, 58, 237, 0.3)" />
                <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
              </linearGradient>
            </defs>
              <path
                d="M 0 50 A 100 100 0 0 1 0 250"
                stroke="url(#leftGradient)"
                strokeWidth="40"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Right semicircle arc */}
          <div className="decoration-right">
            <svg width="200" height="300" viewBox="0 0 200 300" className="arc-svg">
              <defs>
                <linearGradient id="rightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
                  <stop offset="20%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="80%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
                </linearGradient>
              </defs>
              <path
                d="M 200 50 A 100 100 0 0 0 200 250"
                stroke="url(#rightGradient)"
                strokeWidth="40"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="hero-content">
            <div className="brand-info">
              <div className="brand-icon"></div>
              <span className="brand-text">AI Interview Intelligence</span>
            </div>

            <h1 className="hero-title1 title-gradient">
              Start your
              <br />
              our platform today
            </h1>

            <p className="hero-subtitle">
             Empower your hiring process with AI-driven interview insights.
No sign-up fees.<br /> No hidden costs. Just smarter interviews, instantly.

            </p>

            <button className="cta-button" onClick={handleClick}>Get Started Now</button>
          </div>
        </div>
      </div>

      {/* Footer Section - Connected directly without any gap */}
      <footer className="footer">
        <div className="footer-container">
          {/* Main footer content */}
          <div className="footer-content">
            {/* Brand section */}
            <div className="footer-brand">
              <div className="footer-brand-info">
                <div className="footer-brand-icon"></div>
                <span className="footer-brand-text">Omni-text SaaS analytics</span>
              </div>
              <p className="footer-brand-description">
                Unlock the full potential of your data with our comprehensive SaaS analytics platform.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Navigation columns */}
            <div className="footer-nav">
              <div className="footer-column">
                <h3 className="footer-column-title">Product</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      Analytics Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Data Visualization
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Real-time Reports
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      API Access
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Integrations
                    </a>
                  </li>
                </ul>
              </div>

              <div className="footer-column">
                <h3 className="footer-column-title">Company</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Press
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Partners
                    </a>
                  </li>
                </ul>
              </div>

              <div className="footer-column">
                <h3 className="footer-column-title">Resources</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Case Studies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Webinars
                    </a>
                  </li>
                </ul>
              </div>

              <div className="footer-column">
                <h3 className="footer-column-title">Legal</h3>
                <ul className="footer-links">
                  <li>
                    <a href="#" className="footer-link">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      GDPR
                    </a>
                  </li>
                  <li>
                    <a href="#" className="footer-link">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter section
          <div className="footer-newsletter">
            <div className="newsletter-content">
              <h3 className="newsletter-title">Stay updated</h3>
              <p className="newsletter-description">Get the latest insights and updates delivered to your inbox.</p>
            </div>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="newsletter-input" />
              <button className="newsletter-button">Subscribe</button>
            </div>
          </div> */}

          {/* Bottom section */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="footer-copyright">© 2024 Omni-text SaaS Analytics. All rights reserved.</p>
              <div className="footer-bottom-links">
                <a href="#" className="footer-bottom-link">
                  Status
                </a>
                <a href="#" className="footer-bottom-link">
                  Sitemap
                </a>
                <a href="#" className="footer-bottom-link">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
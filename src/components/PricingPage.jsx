import "./PricingPage.css"

function PricingPage() {
  const pricingPlans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for beginners getting started with AI interviews",
      features: [
        "5 AI interview sessions per month",
        "Basic feedback and scoring",
        "Standard question library",
        "Email support",
        "Progress tracking",
      ],
      buttonText: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for serious job seekers and career advancement",
      features: [
        "Unlimited AI interview sessions",
        "Advanced feedback and analytics",
        "Premium question library",
        "Industry-specific scenarios",
        "Priority support",
        "Custom interview recordings",
        "Performance insights dashboard",
      ],
      buttonText: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "Comprehensive solution for teams and organizations",
      features: [
        "Everything in Professional",
        "Team management dashboard",
        "Custom branding",
        "API access",
        "Dedicated account manager",
        "Advanced reporting",
        "SSO integration",
        "Custom integrations",
      ],
      buttonText: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <div className="pricing-container">
      {/* <div className="stars"></div> */}
      <div className="glow-effect"></div>
      <main className="main-content">
        <div className="pricing-header">
          <h1 className="pricing-title">Choose Your Plan</h1>
          <p className="pricing-subtitle">
          </p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.popular ? "popular" : ""}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="features-list">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="feature-item">
                    <span className="checkmark">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`plan-button ${plan.popular ? "popular-button" : ""}`}>{plan.buttonText}</button>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p className="footer-text">All plans come with a 14-day free trial. No credit card required.</p>
          <div className="footer-links">
            <a href="#" className="footer-link">
              View detailed comparison
            </a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">
              Contact support
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PricingPage;

"use client"

import { useState, useEffect } from "react"
import "./Reviews.css"

const reviews = [
  {
    id: 1,
    name: "Sarah Chen",
    rating: 5,
    date: "2024-01-15",
    title: "Absolutely Perfect!",
    content: "This service exceeded all my expectations. The attention to detail and customer support is phenomenal.",
    likes: 24,
    verified: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    rating: 5,
    date: "2024-01-12",
    title: "Game Changer",
    content: "Revolutionary approach to the industry. I've never experienced anything quite like this before.",
    likes: 18,
    verified: true,
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    rating: 4,
    date: "2024-01-10",
    title: "Highly Recommend",
    content: "Outstanding quality and service. The team really knows what they're doing.",
    likes: 31,
    verified: true,
  },
  {
    id: 4,
    name: "David Kim",
    rating: 5,
    date: "2024-01-08",
    title: "Incredible Experience",
    content: "From start to finish, everything was seamless. Will definitely be coming back!",
    likes: 27,
    verified: true,
  },
  {
    id: 5,
    name: "Aisha Patel",
    rating: 5,
    date: "2024-01-05",
    title: "Beyond Expectations",
    content: "The level of professionalism and quality is unmatched. Truly impressed with every aspect.",
    likes: 42,
    verified: true,
  },
  {
    id: 6,
    name: "James Wilson",
    rating: 4,
    date: "2024-01-03",
    title: "Fantastic Service",
    content: "Great experience overall. The team was responsive and delivered exactly what was promised.",
    likes: 19,
    verified: true,
  },
]

// SVG Icons as components
const StarIcon = ({ filled }) => (
  <svg className={`star ${filled ? "filled" : "empty"}`} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const QuoteIcon = () => (
  <svg className="quote-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 17h3l2-4V7h-6v6h3M6 17h3l2-4V7H5v6h3l-2 4z" />
  </svg>
)

const UserIcon = () => (
  <svg className="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="calendar-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
)

const ThumbsUpIcon = () => (
  <svg className="thumbs-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </svg>
)

export default function Reviews() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedCards, setLoadedCards] = useState([])

  useEffect(() => {
    setIsLoaded(true)

    // Stagger card animations
    reviews.forEach((_, index) => {
      setTimeout(() => {
        setLoadedCards((prev) => [...prev, index])
      }, index * 150)
    })
  }, [])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < rating} />)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleLikeClick = (reviewId) => {
    console.log(`Liked review ${reviewId}`)
  }

  const handleGetStarted = () => {
    console.log("Get Started clicked")
  }

  return (
    <div className="review-page">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="bg-blur-1"></div>
        <div className="bg-blur-2"></div>
        <div className="bg-blur-3"></div>
      </div>

      <div className={`main-content ${isLoaded ? "loaded" : ""}`}>
        {/* Header */}
        <div className="header">
          <h1 className="main-title">REVIEWS</h1>
          <p className="subtitle">What our amazing customers are saying about their experience</p>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">4.8</div>
              <div className="star-rating">{renderStars(5)}</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="divider"></div>
            <div className="stat-item">
              <div className="stat-number">1,247</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
        </div>

        {/* Top Reviews Section */}
        <div className="top-reviews-section">
          <h2 className="top-reviews-title">TOP REVIEWS</h2>
        </div>

        {/* Reviews Grid */}
        <div className="reviews-container">
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div key={review.id} className={`review-card-wrapper ${loadedCards.includes(index) ? "loaded" : ""}`}>
                <div className="review-card">
                  <div className="card-glow"></div>
                  <QuoteIcon />

                  <div className="review-header">
                    <div className="avatar">
                      <UserIcon />
                    </div>
                    <div className="user-info">
                      <div className="user-name-container">
                        <h3 className="user-name">{review.name}</h3>
                        {review.verified && (
                          <div className="verified-badge">
                            <div className="verified-dot"></div>
                          </div>
                        )}
                      </div>
                      <div className="rating-date">
                        <div className="star-rating">{renderStars(review.rating)}</div>
                        <span className="date-info">
                          <CalendarIcon />
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="review-title">{review.title}</h4>
                  <p className="review-content">{review.content}</p>

                  <div className="review-footer">
                    <button className="like-button" onClick={() => handleLikeClick(review.id)}>
                      <ThumbsUpIcon />
                      <span className="like-count">{review.likes}</span>
                    </button>
                    <span className="verified-text">Verified Purchase</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-container">
            <h2 className="cta-title">Ready to Join Them?</h2>
            <p className="cta-description">Experience the same amazing service that our customers rave about</p>
            <button className="cta-button" onClick={handleGetStarted}>
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

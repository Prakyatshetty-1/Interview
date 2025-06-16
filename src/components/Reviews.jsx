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
    avatar: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    rating: 5,
    date: "2024-01-12",
    title: "Game Changer",
    content: "Revolutionary approach to the industry. I've never experienced anything quite like this before.",
    avatar: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    rating: 4,
    date: "2024-01-10",
    title: "Highly Recommend",
    content: "Outstanding quality and service. The team really knows what they're doing.",
    avatar: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
  {
    id: 4,
    name: "David Kim",
    rating: 5,
    date: "2024-01-08",
    title: "Incredible Experience",
    content: "From start to finish, everything was seamless. Will definitely be coming back!",
    avatar: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
  {
    id: 5,
    name: "Aisha Patel",
    rating: 5,
    date: "2024-01-05",
    title: "Beyond Expectations",
    content: "The level of professionalism and quality is unmatched. Truly impressed.",
    avatar: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
  {
    id: 6,
    name: "James Wilson",
    rating: 4,
    date: "2024-01-03",
    title: "Fantastic Service",
    content: "Great experience overall. The team was responsive and delivered exactly what was promised.",
    avatar: "/placeholder.svg?height=80&width=80",
    verified: true,
  },
]

const ratingBreakdown = [
  { stars: 5, count: 940, percentage: 88 },
  { stars: 4, count: 243, percentage: 23 },
  { stars: 3, count: 64, percentage: 6 },
  { stars: 2, count: 0, percentage: 0 },
  { stars: 1, count: 0, percentage: 0 },
]

// SVG Icons
const StarIcon = ({ filled }) => (
  <svg className={`star ${filled ? "filled" : "empty"}`} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const EditIcon = () => (
  <svg className="edit-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)

const PhotoIcon = () => (
  <svg className="photo-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
)

export default function Reviews() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadedCards, setLoadedCards] = useState([])

  useEffect(() => {
    setIsLoaded(true)
    reviews.forEach((_, index) => {
      setTimeout(() => {
        setLoadedCards((prev) => [...prev, index])
      }, index * 100)
    })
  }, [])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < rating} />)
  }

  const totalReviews = ratingBreakdown.reduce((sum, item) => sum + item.count, 0)
  const averageRating = 4.8

  return (
    <div className="reviews-page">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="bg-blur-1"></div>
        <div className="bg-blur-2"></div>
        <div className="bg-blur-3"></div>
      </div>

      <div className={`main-content ${isLoaded ? "loaded" : ""}`}>
        {/* Reviews Header */}
        <section className="reviews-header-section">
          <h1 className="reviews-main-title">REVIEWS</h1>
          <p className="reviews-subtitle">What our amazing customers are saying about their experience</p>
        </section>

        {/* Rating Summary Section */}
        <section className="rating-summary-section">
          <div className="rating-summary-container">
            <div className="rating-overview">
              <div className="overall-rating">
                <div className="rating-number">{averageRating}</div>
                <div className="rating-stars">{renderStars(5)}</div>
                <div className="total-reviews">{totalReviews.toLocaleString()} Reviews</div>
              </div>

              <div className="rating-breakdown">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="rating-row">
                    <div className="rating-label">{item.stars} stars</div>
                    <div className="rating-bar">
                      <div className="rating-fill" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                    <div className="rating-count">({item.count})</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="write-review-btn">
              <EditIcon />
              <PhotoIcon />
              Write a review
            </button>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="reviews-container">
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div key={review.id} className={`review-card-wrapper ${loadedCards.includes(index) ? "loaded" : ""}`}>
                <div className="review-card">
                  <div className="review-header">
                    <div className="review-info">
                      <div className="review-stars">{renderStars(review.rating)}</div>
                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-content">{review.content}</p>
                      <div className="reviewer-name">- {review.name}</div>
                    </div>
                    <div className="reviewer-avatar">
                      <PhotoIcon />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

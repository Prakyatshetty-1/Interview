"use client"

import { useState } from "react"
import Card from "./Card"
import "./SlidingCard.css"

const ChevronLeft = () => (
  <svg className="chevron-icon" viewBox="0 0 24 24">
    <polyline points="15,18 9,12 15,6"></polyline>
  </svg>
)

const ChevronRight = () => (
  <svg className="chevron-icon" viewBox="0 0 24 24">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
)

const SliderCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Sample course data - replace with your actual data
  const courseData = [
    {
      difficulty: "Easy",
      title: "Data Structures and Algorithms",
      creator: "LeetCode",
      tags: ["DSA", "Interview"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 13,
      items: 149,
      progress: 0,
    },
    {
      difficulty: "Med",
      title: "System Design for Interviews and Beyond",
      creator: "Tech Lead",
      tags: ["System Design", "Architecture"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 16,
      items: 81,
      progress: 0,
    },
    {
      difficulty: "Easy",
      title: "The LeetCode Beginner's Guide",
      creator: "LeetCode",
      tags: ["Beginner", "Coding"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 4,
      items: 17,
      progress: 0,
    },
    {
      difficulty: "Hard",
      title: "Top Interview Questions",
      creator: "Interview Master",
      tags: ["Interview", "Hard"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 9,
      items: 48,
      progress: 0,
    },
    {
      difficulty: "Med",
      title: "Dynamic Programming",
      creator: "Algorithm Expert",
      tags: ["DP", "Advanced"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 6,
      items: 55,
      progress: 0,
    },
    {
      difficulty: "Easy",
      title: "Arrays 101",
      creator: "Data Structure Pro",
      tags: ["Arrays", "Basics"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 6,
      items: 31,
      progress: 0,
    },
    {
      difficulty: "Hard",
      title: "Google Interview Preparation",
      creator: "Big Tech Prep",
      tags: ["Google", "Premium"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 9,
      items: 85,
      progress: 0,
    },
    {
      difficulty: "Med",
      title: "SQL Language Mastery",
      creator: "Database Expert",
      tags: ["SQL", "Database"],
      path: "/placeholder.svg?height=260&width=260",
      chapters: 4,
      items: 36,
      progress: 0,
    },
  ]

  const cardsPerView = 5 // Show 5 cards at once like in the image
  const maxIndex = Math.max(0, courseData.length - cardsPerView)

  const slideLeft = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const slideRight = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        {/* Header Section */}
        <div className="slider-header">
          <h1 className="slider-title">Featured</h1>
          <button className="more-button">More</button>
        </div>

        {/* Slider Container */}
        <div className="slider-main">
          {/* Left Navigation Arrow */}
          <button onClick={slideLeft} disabled={currentIndex === 0} className="nav-arrow nav-arrow-left">
            <ChevronLeft />
          </button>

          {/* Right Navigation Arrow */}
          <button onClick={slideRight} disabled={currentIndex >= maxIndex} className="nav-arrow nav-arrow-right">
            <ChevronRight />
          </button>

          {/* Cards Slider */}
          <div className="cards-container">
            <div
              className="cards-track"
              style={{
                transform: `translateX(-${currentIndex * 284}px)`, // 260px card + 24px gap
              }}
            >
              {courseData.map((course, index) => (
                <div key={index} className="card-item">
                  <Card
                    difficulty={course.difficulty}
                    title={course.title}
                    creator={course.creator}
                    tags={course.tags}
                    path={course.path}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Course Stats Row */}
          <div className="stats-container">
            <div
              className="stats-track"
              style={{
                transform: `translateX(-${currentIndex * 284}px)`,
              }}
            >
              {courseData.map((course, index) => (
                <div key={index} className="stats-item">
                  <div className="stats-numbers">
                    <div className="stats-number-group">
                      <span className="stats-number">{course.chapters}</span>
                      <span className="stats-number">{course.items}</span>
                      <span className="stats-progress">{course.progress}%</span>
                    </div>
                  </div>
                  <div className="stats-labels">
                    <span>Chapters</span>
                    <span>Items</span>
                    <span className="progress-label">Progress</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="navigation-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`nav-dot ${index === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SliderCard

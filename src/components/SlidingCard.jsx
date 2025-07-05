"use client"

import { useState,useEffect } from "react"
import Card from "./Card"
import "./SlidingCard.css"
import cardDataJson from "../data/CardData.json"


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

const SliderCard = (props) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [courseData, setCardData] = useState([])


  useEffect(() => {
      setCardData(cardDataJson)
    }, [])
  
  useEffect(() => {
  let filteredData = [...cardDataJson];

  const topCompanies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
    "Oracle",
    "Uber",
    "Tesla",
    "Nvidia",
    "Adobe",
    "Salesforce"
  ];

  if (props.tag === "Features") {
    filteredData = filteredData.slice(0, 20);
  } else if (props.tag === "Popular") {
    filteredData.sort((a, b) => b.popularity - a.popularity);
  } else if (props.tag === "Top Companies") {
    filteredData.sort((a, b) => {
      const indexA = topCompanies.indexOf(a.company);
      const indexB = topCompanies.indexOf(b.company);

      // Items in topCompanies come first, in their given order.
      if (indexA === -1 && indexB === -1) return 0; // Neither are in top list
      if (indexA === -1) return 1; // a is lower
      if (indexB === -1) return -1; // b is lower
      return indexA - indexB; // sort by topCompanies order
    });
  }
    filteredData = filteredData.slice(0, 10);


  setCardData(filteredData);
}, [props.tag]);



  

  const cardsPerView = 5 // Show 5 cards at once

  // CHANGE 1: Fixed maxIndex calculation to ensure we can reach the last card
  // With 10 cards showing 5 at a time, we need 6 positions (0-5) to show all cards
  const maxIndex = courseData.length - cardsPerView

  const slideLeft = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const slideRight = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  // CHANGE 2: Completely rewrote the transform calculation logic
  const getTransform = () => {
    const cardWidth = 260 // Card width
    const gap = 24 // Gap between cards
    const cardWithGap = cardWidth + gap // Total space per card = 284px

    if (currentIndex === 0) {
      // First position: start from 0 (first card fully visible)
      return 0
    } else if (currentIndex === maxIndex) {
      // CHANGE 3: Last position calculation - ensure last card is fully visible
      // Calculate how much to move left to show the last 'cardsPerView' cards
      // Total cards that need to be hidden from the left = (totalCards - cardsPerView)
      // Move left by: hiddenCards * cardWithGap
      const hiddenCardsFromLeft = courseData.length - cardsPerView-0.4
      return -(hiddenCardsFromLeft * cardWithGap)
    } else {
      // CHANGE 4: Middle positions - show partial cards with proper offset
      // Move by currentIndex * cardWithGap, plus half card offset for partial view
      return -(currentIndex * cardWithGap -5 / 2)
    }
  }

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        {/* Header Section */}
        <div className="slider-header">
          <h1 className="slider-title">{props.tag}</h1>
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

          {/* Slider Content with Fade Effects */}
          <div className="slider-content">
            <div className="slider-viewport">
              {/* Conditional fade overlays - only show when not at first/last position */}
              {currentIndex > 0 && <div className="fade-overlay fade-left"></div>}
              {currentIndex < maxIndex && <div className="fade-overlay fade-right"></div>}

              {/* Cards Slider */}
              <div className="cards-container">
                <div
                  className="cards-track"
                  style={{
                    transform: `translateX(${getTransform()}px)`,
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

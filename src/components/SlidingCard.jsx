"use client"

import { useState, useEffect } from "react"
import Card from "./Card"
import "./SlidingCard.css"
import CardFolder from "./CardFolder"
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
    let filteredData = [...cardDataJson]
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
    ]

    if (props.tag === "Featured") {
      // Show first 20 items with title
      filteredData = filteredData.slice(0, 10)
    } else if (props.tag === "Popular") {
      // Sort by popularity and show top 10
      filteredData.sort((a, b) => b.popularity - a.popularity)
      filteredData = filteredData.slice(0, 10)
    } else if (props.tag === "Top Companies") {
      // Filter for top companies only, remove duplicates
      const seenCompanies = new Set()
      filteredData = filteredData.filter(item => {
        if (topCompanies.includes(item.company) && !seenCompanies.has(item.company)) {
          seenCompanies.add(item.company)
          return true
        }
        return false
      })
      // Sort by the order in topCompanies array
      filteredData.sort((a, b) => {
        return topCompanies.indexOf(a.company) - topCompanies.indexOf(b.company)
      })
    }
    else{
      filteredData = filteredData.slice(0, 10)

    }

    setCardData(filteredData)
  }, [props.tag])

  const cardsPerView = 5
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

  const getTransform = () => {
    const cardWidth = 260
    const gap = 24
    const cardWithGap = cardWidth + gap

    if (currentIndex === 0) {
      return 0
    } else if (currentIndex === maxIndex) {
      const hiddenCardsFromLeft = courseData.length - cardsPerView - 0.4
      return -(hiddenCardsFromLeft * cardWithGap)
    } else {
      return -(currentIndex * cardWithGap - 5 / 2)
    }
  }

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        <div className="slider-header">
          <h1 className="slider-title">{props.tag}</h1>
          <button className="more-button">More</button>
        </div>

        <div className="slider-main">
          <button 
            onClick={slideLeft} 
            disabled={currentIndex === 0} 
            className="nav-arrow nav-arrow-left"
          >
            <ChevronLeft />
          </button>

          <button 
            onClick={slideRight} 
            disabled={currentIndex >= maxIndex} 
            className="nav-arrow nav-arrow-right"
          >
            <ChevronRight />
          </button>

          <div className="slider-content">
            <div className="slider-viewport">
              {currentIndex > 0 && <div className="fade-overlay fade-left"></div>}
              {currentIndex < maxIndex && <div className="fade-overlay fade-right"></div>}

              <div className="cards-container">
                <div
                  className="cards-track"
                  style={{
                    transform: `translateX(${getTransform()}px)`,
                  }}
                >
                  {courseData.map((course, index) => (
                    <div key={index} className="card-item">
                      {props.tag === "Features" ? (
                        <CardFolder
                          title={course.title}
                        />
                      ) : props.tag === "Top Companies" ? (
                        <CardFolder
                          title={course.company}
                        />
                      ) : (
                        <CardFolder
                          title={course.title}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
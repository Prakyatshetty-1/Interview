"use client"

import { useState, useEffect } from "react"
import "./SlidingCard.css"
import CardFolder from './CardFolder'
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.querySelector(`.slider-container[data-tag="${props.tag}"]`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [props.tag])

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

    if (props.tag === "Featured") {
      const categories=[
        {
          title: "Front End",
          path:"/FrontEndDev.png"
        },
        {
          title: "Back End",
          path:"/BackEndDev.png"
        },
        {
          title: "Full Stack",
          path:"/FullStackWebDev.png"
        },
        {
          title: "Mobile Dev",
          path:"/MobileDev.png"
        },
        {
          title: "ML Engineering",
          path:"/MLEngineering.png"
        },
        {
          title: "AIML",
          path:"/AIResearch.png"
        },
        {
          title: "JAVA",
          path:""
        },
        {
          title: "Data Engineer",
          path:"/DataEngineer.png"
        },
        {
          title: "UIUX",
          path:"/DesktopDev.png"
        },

      ]

      filteredData = categories;
    } else if (props.tag === "Popular") {
      filteredData.sort((a, b) => b.popularity - a.popularity);
    } else if (props.tag === "Top Companies") {
      const categories=[
        {
          title: "Google",
          path:"/Google.png"
        },
        {
          title: "Microsoft",
          path:"/Microsoft.png"
        },
        {
          title: "Amazon",
          path:"/Amazon.png"
        },
        {
          title: "Meta",
          path:"/Meta.png"
        },
        {
          title: "Apple",
          path:"/Apple.png"
        },
        {
          title: "Netflix",
          path:"/Netflix.png"
        },
        {
          title: "Oracle",
          path:"/Oracle.png"
        },
        {
          title: "Uber",
          path:"/Uber.png"
        },
        {
          title: "Tesla",
          path:"/DesktopDev.png"
        },
        {
          title: "Adobe",
          path:"/Adobe.png"
        },

      ]

      filteredData = categories;
    }
    else if (props.tag === "Paid"){
      filteredData = cardDataJson.filter(item => item.paid === true);

    }
    filteredData = filteredData.slice(0, 10);


    setCardData(filteredData);
  }, [props.tag]);


  const cardsPerView = 5
  const maxIndex = courseData.length - cardsPerView

  const slideLeft = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => Math.max(0, prev -1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const slideRight = (index) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    if(index===0)
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 0.8))
    else
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
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
    <div
      className={`slider-container ${isVisible ? 'animate-in' : ''}`}
      data-tag={props.tag}
    >
      <div className="slider-wrapper">
        {/* Header Section */}
        <div className="slider-header">
          <h1 className="slider-title">{props.tag}</h1>
          <button className="more-button">
            More
            <svg className="more-arrow" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slider Container */}
        <div className="slider-main">
          {/* Left Navigation Arrow */}
          <button
            onClick={()=>slideLeft}
            disabled={currentIndex === 0 || isTransitioning}
            className="nav-arrow nav-arrow-left"
          >
            <ChevronLeft />
          </button>

          {/* Right Navigation Arrow */}
          <button
            onClick={()=>slideRight(currentIndex)}
            disabled={currentIndex >= maxIndex-0.5 || isTransitioning}
            className="nav-arrow nav-arrow-right"
          >
            <ChevronRight />
          </button>

          {/* Slider Content with Fade Effects */}
          <div className="slider-content">
            <div className="slider-viewport">
              {/* Conditional fade overlays */}
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
                    <div
                      key={index}
                      className="card-item"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <CardFolder
                        title={ course.title}
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
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SliderCard
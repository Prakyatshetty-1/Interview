"use client"

import { useState } from "react";
import "./Preference.css";

const questions = [
  {
    id: 1,
    title: "Tell us about your professional status",
    subtitle: "Help us understand your current situation better",
    type: "multi-question",
    image: "/pref1.png",
    subQuestions: [
      {
        id: "status",
        question: "Which of the following best describes your current status?",
        subtitle: "(Please choose one)",
        type: "radio",
        required: true,
        options: [
          "Fresher",
          "Actively looking for a job",
          "Currently working",
          "Entrepreneur / Freelancer"
        ]
      },
      {
        id: "experience",
        question: "Which companies have you worked with, and how many years of experience do you have in each?",
        type: "textarea",
        required: false,
        placeholder: "e.g., Google - 2 years, Microsoft - 1.5 years, or write 'N/A' if not applicable"
      }
    ]
  },
  {
    id: 2,
    title: "Your educational and professional background",
    subtitle: "Tell us more about your background",
    type: "multi-question",
    image: "/pref2.png",
    subQuestions: [
      {
        id: "college",
        question: "If you are a fresher, which college or university are you currently studying at (or recently graduated from)?",
        type: "textarea",
        required: false,
        placeholder: "e.g., MIT, Stanford University, IIT Delhi, or write 'N/A' if not applicable"
      },
      {
        id: "field",
        question: "Which field or industry are you from?",
        type: "textarea",
        required: true,
        placeholder: "e.g., Software Development, Data Science, Marketing, Finance, etc."
      }
    ]
  },
  {
    id: 3,
    title: "Your career goals and platform usage",
    subtitle: "Help us understand your aspirations and how we can help",
    type: "multi-question",
    image: "/pref3.png",
    subQuestions: [
      {
        id: "career_roles",
        question: "What kind of job roles or career paths are you interested in?",
        type: "textarea",
        required: true,
        placeholder: "e.g., Software Engineer, Data Scientist, Product Manager, Marketing Specialist..."
      },
      {
        id: "platform_usage",
        question: "Why do you want to use our interview platform?",
        subtitle: "(Please choose one)",
        type: "radio",
        required: true,
        options: [
          "To practice mock interviews",
          "To improve my interview performance",
          "To get feedback and insights",
          "To prepare for real job interviews"
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Where did you hear about us?",
    subtitle: "Help us understand how you discovered our platform",
    type: "radio",
    image: "/pref4.png",
    required: true,
    options: [
      "🌐 Google Search",
      "📱 Social Media (Instagram, LinkedIn, etc.)",
      "🧑‍🤝‍🧑 Friend or Referral",
      "📰 Online Ads or Promotions"
    ]
  },
  
]

export default function Preference() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setIsAnimating(true)
      await new Promise((resolve) => setTimeout(resolve, 400))
      setCurrentStep(currentStep + 1)
      await new Promise((resolve) => setTimeout(resolve, 100))
      setIsAnimating(false)
    }
  }

  const handleSubmit = () => {
    console.log("Submitted answers:", answers)
    alert("Thank you! Your responses have been submitted.")
  }

  const handleAnswerChange = (value, subQuestionId = null) => {
    if (subQuestionId) {
      // Handle multi-question answers
      setAnswers((prev) => ({
        ...prev,
        [currentStep]: {
          ...prev[currentStep],
          [subQuestionId]: value,
        }
      }))
    } else {
      // Handle single question answers
      setAnswers((prev) => ({
        ...prev,
        [currentStep]: value,
      }))
    }
  }

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(stepIndex)
        setIsAnimating(false)
      }, 200)
    }
  }

  const isLastStep = currentStep === questions.length - 1
  const currentQuestion = questions[currentStep]
  
  // Check if current step can proceed
  const canProceed = () => {
    if (currentQuestion.type === "multi-question") {
      const currentAnswers = answers[currentStep] || {}
      // Check if all required sub-questions are answered
      const requiredAnswered = currentQuestion.subQuestions
        .filter(sq => sq.required)
        .every(sq => currentAnswers[sq.id]?.trim()?.length > 0)
      return requiredAnswered
    } else if (currentQuestion.type === "radio") {
      // For radio questions, check if an option is selected
      return answers[currentStep]?.trim()?.length > 0
    } else {
      return answers[currentStep]?.trim()?.length > 0
    }
  }

  const renderMultiQuestion = () => {
    const currentAnswers = answers[currentStep] || {}
    
    return (
      <div className="multi-question-container">
        {currentQuestion.subQuestions.map((subQuestion, index) => (
          <div key={subQuestion.id} className="sub-question-group">
            <div className="sub-question-header">
              <h3 className="sub-question-title">
                {index + 1}. {subQuestion.question}
                {subQuestion.required && <span className="required-indicator">*</span>}
              </h3>
              {subQuestion.subtitle && (
                <p className="sub-question-subtitle">{subQuestion.subtitle}</p>
              )}
            </div>

            {subQuestion.type === "radio" && (
              <div className="radio-group">
                {subQuestion.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="radio-option">
                    <input
                      type="radio"
                      name={`question-${currentStep}-${subQuestion.id}`}
                      value={option}
                      checked={currentAnswers[subQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(e.target.value, subQuestion.id)}
                      className="radio-input"
                    />
                    <span className="radio-custom"></span>
                    <span className="radio-label">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {subQuestion.type === "textarea" && (
              <textarea
                value={currentAnswers[subQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value, subQuestion.id)}
                placeholder={subQuestion.placeholder}
                className="textarea-input"
                rows={3}
              />
            )}

            {subQuestion.type === "text" && (
              <input
                type="text"
                value={currentAnswers[subQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value, subQuestion.id)}
                placeholder={subQuestion.placeholder}
                className="text-input"
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderRadioQuestion = () => {
    return (
      <div className="radio-question-container">
        <div className="radio-group">
          {currentQuestion.options.map((option, optionIndex) => (
            <label key={optionIndex} className="radio-option">
              <input
                type="radio"
                name={`question-${currentStep}`}
                value={option}
                checked={answers[currentStep] === option}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="radio-input"
              />
              <span className="radio-custom"></span>
              <span className="radio-label">{option}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  const renderSingleQuestion = () => {
    return (
      <div className="input-group">
        <label htmlFor={`question-${currentStep}`} className="input-label">
          Your Response
        </label>
        {currentQuestion.type === "textarea" ? (
          <textarea
            id={`question-${currentStep}`}
            value={answers[currentStep] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="textarea-input"
            rows={4}
          />
        ) : (
          <input
            id={`question-${currentStep}`}
            type="text"
            value={answers[currentStep] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="text-input"
          />
        )}
      </div>
    )
  }

  const renderQuestionContent = () => {
    if (currentQuestion.type === "multi-question") {
      return renderMultiQuestion()
    } else if (currentQuestion.type === "radio") {
      return renderRadioQuestion()
    } else {
      return renderSingleQuestion()
    }
  }

  return (
    <div className="questionnaire-container">
      <div className="p-bg-orbs3">
        <div className="p-orbs p-orb31"></div>
        <div className="p-orbs p-orb32"></div>
        <div className="p-orbs p-orb33"></div>
        <div className="p-orbs p-orb34"></div>
        <div className="p-orbs p-orb35"></div>
      </div>
      <div className="questionnaire-layout">
        {/* Left Side - Image and Progress */}
        <div className="left-panel1">
          {/* Logo */}
          <div className="logo-container1">
            <span className="logo">Askora</span>
          </div>

          {/* Image Container */}
          <div className="image-section">
            <div className="image-container">
              <div className={`image-wrapper ${isAnimating ? "animating" : ""}`}>
                <img
                  src={currentQuestion.image || "/placeholder.svg"}
                  alt={`Step ${currentStep + 1}`}
                  className="step-image"
                />
                <div className="image-overlay" />
              </div>
            </div>
          </div>

          {/* Clean Expanding Progress Bar */}
          <div className="progress-section">
            <div className="expanding-progress-bar">
              <div className="progress-container">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`progress-segment ${
                      index === currentStep ? "active" : ""
                    } ${index < currentStep ? "completed" : ""} ${index > currentStep ? "upcoming" : ""}`}
                    onClick={() => handleStepClick(index)}
                  >
                    {/* Segment Background */}
                    <div className="segment-bg">
                      <div className="segment-fill"></div>
                      <div className="segment-glow"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Questions */}
        <div className="right-panel">
          <div className={`question-content ${isAnimating ? "animating" : ""}`}>
            <div className="question-wrapper">
              <div className="question-header">
                <h1 className="question-title">{currentQuestion.title}</h1>
                <p className="question-subtitle">{currentQuestion.subtitle}</p>
              </div>

              <div className="form-section">
                {renderQuestionContent()}

                <div className="button-section1">
                  {isLastStep ? (
                    <button 
                      onClick={handleSubmit} 
                      disabled={!canProceed()} 
                      className="submit-button1" 
                      type="button"
                    >
                      Submit Response
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed() || isAnimating}
                      className="continue-button1"
                      type="button"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
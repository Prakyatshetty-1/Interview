"use client"

import React, { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, ChevronDown } from "lucide-react"
import "./CreateInterview.css"

// Simple Toast hook replacement
const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      alert(`${title}: ${description}`)
    },
  }
}

// UI Components
const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseClass = "btn-base"
  const variantClass = `btn-${variant}`
  const sizeClass = size === "lg" ? "btn-lg" : "btn-default-size"
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = "" }) => <div className={`card ${className}`}>{children}</div>
const CardHeader = ({ children, className = "" }) => <div className={`card-header ${className}`}>{children}</div>
const CardTitle = ({ children, className = "" }) => <h3 className={`card-title ${className}`}>{children}</h3>
const CardContent = ({ children, className = "" }) => <div className={`card-content ${className}`}>{children}</div>
const Input = ({ className = "", ...props }) => <input className={`input ${className}`} {...props} />
const Label = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`label ${className}`}>
    {children}
  </label>
)

const Select = ({ value, onValueChange, children, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")

  useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  const options = React.Children.toArray(children).map((child) => ({
    value: child.props.value,
    label: child.props.children,
  }))

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue)
    onValueChange && onValueChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="select-container">
      <button type="button" className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className={selectedOption ? "select-value" : "select-placeholder"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="chevron-icon" />
      </button>
      {isOpen && (
        <div className="select-content">
          {options.map((option) => (
            <div key={option.value} className="select-item" onClick={() => handleSelect(option.value)}>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const SelectItem = ({ value, children }) => {
  return React.createElement("div", { value }, children)
}

const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea className={`textarea ${className}`} rows={rows} {...props} />
)

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantClass = `badge-${variant}`
  return <div className={`badge ${variantClass} ${className}`}>{children}</div>
}

// Main Component with ElevenLabs Integration
export default function CreateInterview() {
  const [step, setStep] = useState("initial")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [questions, setQuestions] = useState([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [transcript, setTranscript] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState("")
  const [showVoiceConfirmation, setShowVoiceConfirmation] = useState(false)
  const [interviewDetails, setInterviewDetails] = useState({
    title: "",
    category: "",
    difficulty: "",
    duration: "",
    description: "",
  })

  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const { toast } = useToast()

  // Replace this with your actual API key
  const ELEVENLABS_API_KEY =import.meta.env.VITE_ELEVENLABS_API_KEY // You can set this directly or get it from your config

  // Default ElevenLabs configuration (no longer changeable by user)
  const elevenLabsConfig = {
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice (default)
    stability: 0.5,
    clarity: 0.75,
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      console.log("✅ Speech Recognition is supported")

      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => {
        console.log("🎤 Speech recognition started")
        setIsListening(true)
      }

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript
        console.log("🗣️ Speech result:", result)
        setTranscript(result)
        handleVoiceInput(result)
      }

      recognitionRef.current.onend = () => {
        console.log("🛑 Speech recognition ended")
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error)
        setIsListening(false)
        let message = "Speech recognition failed. "
        switch (event.error) {
          case "not-allowed":
            message += "Please allow microphone access."
            break
          case "no-speech":
            message += "No speech was detected. Try again."
            break
          case "network":
            message += "Network error occurred."
            break
          default:
            message += "Please try again."
        }
        toast({
          title: "Speech Error",
          description: message,
          variant: "destructive",
        })
      }
    } else {
      console.log("❌ Speech Recognition not supported")
      setSpeechSupported(false)
    }
  }, [toast])

  // ElevenLabs Text-to-Speech function
  const speakWithElevenLabs = async (text) => {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === "your_elevenlabs_api_key_here") {
      console.warn("ElevenLabs API key not configured, falling back to browser TTS")
      speakWithBrowserTTS(text)
      return
    }

    try {
      setIsSpeaking(true)

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsConfig.voiceId}`, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: elevenLabsConfig.stability,
            similarity_boost: elevenLabsConfig.clarity,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        await audioRef.current.play()
      }
    } catch (error) {
      console.error("ElevenLabs TTS Error:", error)
      setIsSpeaking(false)
      // Fallback to browser TTS
      speakWithBrowserTTS(text)
    }
  }

  // Browser TTS fallback
  const speakWithBrowserTTS = (text) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 1
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Main speak function
  const speak = async (text) => {
    if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== "your_elevenlabs_api_key_here") {
      await speakWithElevenLabs(text)
    } else {
      speakWithBrowserTTS(text)
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const startListening = async () => {
    console.log("🔴 Start listening button clicked")
    if (!speechSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
        variant: "destructive",
      })
      return
    }

    if (!recognitionRef.current) {
      toast({
        title: "Error",
        description: "Speech recognition not initialized.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      console.log("🛑 Stopping speech recognition")
      recognitionRef.current.stop()
      return
    }

    try {
      console.log("🎤 Starting speech recognition...")
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error starting recognition:", error)
      toast({
        title: "Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleVoiceInput = (text) => {
    const cleanText = text.trim()
    if (!cleanText) return

    switch (step) {
      case "asking-count":
        const numbers = cleanText.match(/\d+/g)
        const count = numbers ? Number.parseInt(numbers[0]) : 0
        if (count > 0 && count <= 20) {
          setTotalQuestions(count)
          setStep("collecting-questions")
          setCurrentQuestionIndex(0)
          setTimeout(() => {
            speak(`Perfect! I'll collect ${count} questions. Please tell me your first question.`)
          }, 1000)
        } else {
          setTimeout(() => {
            speak("Please say a number between 1 and 20.")
          }, 500)
        }
        break
      case "collecting-questions":
        setPendingQuestion(cleanText)
        setShowVoiceConfirmation(true)
        break
    }
  }

  const handleSubmitQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: pendingQuestion,
    }
    setQuestions((prev) => [...prev, newQuestion])
    const nextIndex = currentQuestionIndex + 1
    setShowVoiceConfirmation(false)
    setPendingQuestion("")
    setTranscript("")

    if (nextIndex < totalQuestions) {
      setCurrentQuestionIndex(nextIndex)
      setTimeout(() => {
        speak(`Got it! Now tell me question number ${nextIndex + 1}.`)
      }, 1000)
    } else {
      setStep("details-form")
      setTimeout(() => {
        speak("Excellent! All questions collected. Please fill out the form below.")
      }, 1000)
    }
  }

  const handleRetryQuestion = () => {
    setShowVoiceConfirmation(false)
    setPendingQuestion("")
    setTranscript("")
    setTimeout(() => {
      speak(`Let's try again. Please tell me question number ${currentQuestionIndex + 1}.`)
    }, 500)
  }

  const handleTextInput = (text) => {
    if (text.trim()) {
      setTranscript(text)
      if (step === "collecting-questions") {
        const newQuestion = {
          id: Date.now(),
          text: text.trim(),
        }
        setQuestions((prev) => [...prev, newQuestion])
        const nextIndex = currentQuestionIndex + 1
        if (nextIndex < totalQuestions) {
          setCurrentQuestionIndex(nextIndex)
          setTimeout(() => {
            speak(`Got it! Now tell me question number ${nextIndex + 1}.`)
          }, 1000)
        } else {
          setStep("details-form")
          setTimeout(() => {
            speak("Excellent! All questions collected. Please fill out the form below.")
          }, 1000)
        }
      } else {
        handleVoiceInput(text)
      }
    }
  }

  const startInterview = () => {
    setStep("greeting")
    setTimeout(() => {
      speak(
        "Hello! Welcome to the Askora Interview creator. I'm here to help you create amazing interview questions using voice or text input. Let's get started!",
      )
    }, 500)
  }

  const proceedToQuestionCount = () => {
    setStep("asking-count")
    setTimeout(() => {
      speak("Great! How many interview questions would you like to create? Please say a number between 1 and 20.")
    }, 500)
  }

  const handleDetailsSubmit = () => {
    if (!interviewDetails.title || !interviewDetails.category || !interviewDetails.difficulty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    setStep("completed")
    speak("Your interview pack has been created successfully!")
  }

  const resetInterview = () => {
    setStep("initial")
    setQuestions([])
    setTotalQuestions(0)
    setCurrentQuestionIndex(0)
    setTranscript("")
    setPendingQuestion("")
    setShowVoiceConfirmation(false)
    setInterviewDetails({
      title: "",
      category: "",
      difficulty: "",
      duration: "",
      description: "",
    })
    stopSpeaking()
  }

  // AI Assistant Circle Component for left panel
  const AIAssistant = () => (
    <iframe
      src="https://my.spline.design/voiceinteractionanimation-2TyeWSP24w6QzdGddVpF30we/"
      frameBorder="0"
      width="100%"
      height="100%"
      title="Askora Voice Interaction Animation"
    />
  )

  return (
    <div className="app-container">
      {/* Hidden audio element for ElevenLabs */}
      <audio ref={audioRef} />

      <div className="split-layout">
        {/* Left Panel - AI Assistant (Dark) */}
        <div className="left-panel">
          <div className="logo-container">
            <div className="logo-header">
              <span className="logo">Askora</span>
            </div>
          </div>

          {/* Background orbs */}
          <div className="pricing-bg-orbs">
            <div className="pricing-orb pricing-orb1"></div>
            <div className="pricing-orb pricing-orb2"></div>
            <div className="pricing-orb pricing-orb3"></div>
            <div className="pricing-orb pricing-orb4"></div>
            <div className="pricing-orb pricing-orb5"></div>
          </div>

          {step === "initial" ? (
            <div className="welcome-screen">
              <h1 className="main-heading">Create Interview Pack</h1>
              <p className="main-subtitle">AI-powered interview question creator</p>
              <Button onClick={startInterview} size="lg" className="start-btn">
                <Volume2 className="btn-icon" />
                Start Creating Interview
              </Button>
              {!speechSupported && (
                <div className="warning-alert">
                  <AlertCircle className="warning-icon" />
                  <p className="warning-text">Speech recognition not supported. Please use Chrome or Edge browser.</p>
                </div>
              )}
            </div>
          ) : step === "greeting" ? (
            <div className="welcome-screen">
              <h2 className="greeting-heading">Welcome! 👋</h2>
              <p className="greeting-subtitle">I'm your AI interview assistant</p>
              <div className="greeting-message">
                <p className="greeting-text">
                  Hello! Welcome to the AI-powered interview creator. I'm here to help you create amazing interview
                  questions using voice or text input.
                </p>
                <p className="greeting-text">
                  I'll guide you through the process step by step. Let's create something great together!
                </p>
              </div>
              <Button onClick={proceedToQuestionCount} size="lg" className="start-btn">
                Let's Get Started!
              </Button>
            </div>
          ) : step === "completed" ? (
            <div className="completion-screen">
              <div className="celebration-icon">🎉</div>
              <h2 className="completion-heading">Interview Pack Created!</h2>
              <p className="completion-subtitle">Your interview is ready to use</p>
              <div className="completion-actions">
                <Button onClick={resetInterview} variant="outline" size="lg" className="completion-btn bg-transparent">
                  Create Another Interview
                </Button>
                <Button size="lg" variant="success" className="completion-btn">
                  View Interview Pack
                </Button>
              </div>
            </div>
          ) : (
            <AIAssistant />
          )}
        </div>

        {/* Right Panel - Controls and Forms (Light) */}
        <div className="right-panel">
          {step === "initial" && (
            <div className="right-content-center">
              <Card className="intro-card">
                <CardHeader className="intro-header">
                  <CardTitle>Ready to Start?</CardTitle>
                  <p className="intro-description">Create your interview questions using voice or text input</p>
                </CardHeader>
                <CardContent className="intro-content">
                  <p className="intro-note">Click "Start Creating Interview" to begin the process.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "greeting" && (
            <div className="right-content-center">
              <Card className="intro-card">
                <CardHeader className="intro-header">
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="steps-list">
                    <div className="step-item">
                      <div className="step-dot"></div>
                      <span>I'll ask how many questions you want</span>
                    </div>
                    <div className="step-item">
                      <div className="step-dot"></div>
                      <span>Collect questions via voice or text</span>
                    </div>
                    <div className="step-item">
                      <div className="step-dot"></div>
                      <span>Fill out interview details</span>
                    </div>
                    <div className="step-item">
                      <div className="step-dot"></div>
                      <span>Generate your interview pack</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {(step === "asking-count" || step === "collecting-questions") && (
            <div className="form-section">
              {/* Voice Input Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="voice-title">
                    <Volume2 className="title-icon" />
                    Voice Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="voice-content">
                  {speechSupported && (
                    <div className="voice-controls">
                      <Button
                        onClick={startListening}
                        variant={isListening ? "destructive" : "default"}
                        size="lg"
                        className="voice-btn"
                      >
                        {isListening ? (
                          <>
                            <MicOff className="btn-icon" />
                            Stop Listening
                          </>
                        ) : (
                          <>
                            <Mic className="btn-icon" />
                            Start Speaking
                          </>
                        )}
                      </Button>
                      {isSpeaking && (
                        <Button onClick={stopSpeaking} variant="outline" size="lg">
                          <VolumeX className="btn-icon" />
                          Stop AI
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="text-input-section">
                    <Label htmlFor="text-input" className="text-input-label">
                      {speechSupported ? "Or type your response:" : "Type your response:"}
                    </Label>
                    <div className="text-input-group">
                      <Input
                        id="text-input"
                        placeholder={step === "asking-count" ? "Enter number (e.g., 5)" : "Type your question here"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = e.currentTarget.value.trim()
                            if (value) {
                              handleTextInput(value)
                              e.currentTarget.value = ""
                            }
                          }
                        }}
                        className="text-input-field"
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById("text-input")
                          const value = input && input.value.trim()
                          if (value) {
                            handleTextInput(value)
                            input.value = ""
                          }
                        }}
                        variant="outline"
                        className="submit-text-btn"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>

                  {transcript && !showVoiceConfirmation && (
                    <div className="transcript-display">
                      <p className="transcript-label">You said:</p>
                      <p className="transcript-text">"{transcript}"</p>
                    </div>
                  )}

                  {showVoiceConfirmation && (
                    <div className="voice-confirmation">
                      <p className="confirmation-label">I heard you say:</p>
                      <div className="confirmation-question">"{pendingQuestion}"</div>
                      <p className="confirmation-prompt">Is this correct?</p>
                      <div className="confirmation-actions">
                        <Button onClick={handleSubmitQuestion} variant="success">
                          Submit Question
                        </Button>
                        <Button onClick={handleRetryQuestion} variant="outline">
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="step-indicator">
                    {step === "asking-count" && "How many questions do you want? (1-20)"}
                    {step === "collecting-questions" && `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
                  </div>
                </CardContent>
              </Card>

              {/* Questions Progress */}
              {questions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Questions Collected ({questions.length}/{totalQuestions})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="questions-list">
                      {questions.map((question, index) => (
                        <div key={question.id} className="question-item">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <p className="question-text">{question.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === "details-form" && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
                <p className="form-description">Complete your interview pack</p>
              </CardHeader>
              <CardContent>
                <div className="form-container">
                  <div className="form-fields">
                    <div className="field-group">
                      <Label htmlFor="title">Interview Title *</Label>
                      <Input
                        id="title"
                        value={interviewDetails.title}
                        onChange={(e) => setInterviewDetails((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Senior Developer Interview"
                        required
                      />
                    </div>

                    <div className="field-row">
                      <div className="field-group">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={interviewDetails.category}
                          onValueChange={(value) => setInterviewDetails((prev) => ({ ...prev, category: value }))}
                          placeholder="Select category"
                        >
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="leadership">Leadership</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </Select>
                      </div>

                      <div className="field-group">
                        <Label htmlFor="difficulty">Difficulty Level *</Label>
                        <Select
                          value={interviewDetails.difficulty}
                          onValueChange={(value) => setInterviewDetails((prev) => ({ ...prev, difficulty: value }))}
                          placeholder="Select difficulty"
                        >
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </Select>
                      </div>
                    </div>

                    <div className="field-group">
                      <Label htmlFor="duration">Expected Duration</Label>
                      <Select
                        value={interviewDetails.duration}
                        onValueChange={(value) => setInterviewDetails((prev) => ({ ...prev, duration: value }))}
                        placeholder="Select duration"
                      >
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </Select>
                    </div>

                    <div className="field-group">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={interviewDetails.description}
                        onChange={(e) => setInterviewDetails((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the interview..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="questions-summary">
                    <h4 className="summary-title">Questions Summary</h4>
                    <p className="summary-count">Total Questions: {questions.length}</p>
                    <div className="summary-list">
                      {questions.map((question, index) => (
                        <div key={question.id} className="summary-item">
                          <span className="summary-number">{index + 1}.</span>
                          <span className="summary-text">{question.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button onClick={handleDetailsSubmit} className="submit-btn" variant="default">
                      Create Interview Pack
                    </Button>
                    <Button onClick={resetInterview} variant="outline">
                      Start Over
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "completed" && (
            <Card>
              <CardHeader className="completion-header">
                <CardTitle>Interview Pack Created! 🎉</CardTitle>
                <p className="completion-description">Your interview is ready to use</p>
              </CardHeader>
              <CardContent>
                <div className="completion-content">
                  <div className="result-summary">
                    <h3 className="result-title">{interviewDetails.title}</h3>
                    <div className="result-grid">
                      <div className="result-item">
                        <span className="result-label">Category:</span> {interviewDetails.category}
                      </div>
                      <div className="result-item">
                        <span className="result-label">Difficulty:</span> {interviewDetails.difficulty}
                      </div>
                      <div className="result-item">
                        <span className="result-label">Duration:</span>{" "}
                        {interviewDetails.duration ? `${interviewDetails.duration} minutes` : "Not specified"}
                      </div>
                      <div className="result-item">
                        <span className="result-label">Questions:</span> {questions.length}
                      </div>
                    </div>
                    {interviewDetails.description && (
                      <div className="result-description">
                        <span className="result-label">Description:</span>
                        <p className="description-text">{interviewDetails.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="final-actions">
                    <Button onClick={resetInterview} variant="outline" className="final-btn bg-transparent">
                      Create Another Interview
                    </Button>
                    <Button className="final-btn" variant="default">
                      View Interview Pack
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

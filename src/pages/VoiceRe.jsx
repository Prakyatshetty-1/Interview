"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, VolumeX, AlertCircle, Sparkles, Loader2 } from "lucide-react"
import "./Voice.css"

function VoiceRe() {
  // Original states
  const [showInstructionsModal, setShowInstructionsModal] = useState(true)
  const [showCreateItemModal, setShowCreateItemModal] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [displayContent, setDisplayContent] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    companies: "",
    difficulty: "easy",
  })

  // Voice and AI states
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const [geminiResponse, setGeminiResponse] = useState("")
  const [isGeminiLoading, setIsGeminiLoading] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)

  const recognitionRef = useRef(null)

  // Gemini API Integration
  const callGeminiAPI = async (prompt) => {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!geminiApiKey) {
      alert("Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.")
      return
    }

    setIsGeminiLoading(true)
    setGeminiResponse("")

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI assistant helping with interview preparation. The user said: "${prompt}". Please provide a helpful, professional response related to interview questions, career advice, or general guidance. Keep your response concise and actionable.`,
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini."

      setGeminiResponse(geminiText)

      // Optional: Speak the Gemini response
      if (voiceMode) {
        setTimeout(() => {
          speak(`AI Assistant says: ${geminiText}`)
        }, 500)
      }
    } catch (error) {
      console.error("Gemini API Error:", error)
      setGeminiResponse("Error: Unable to get response from Gemini API.")
      alert("Failed to get response from AI. Please check your API key and try again.")
    } finally {
      setIsGeminiLoading(false)
    }
  }

  // Speech Recognition Setup
  useEffect(() => {
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
        setInputValue(result)

        // Call Gemini API with the transcript if voice mode is enabled
        if (result.trim() && voiceMode) {
          callGeminiAPI(result)
        }
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
        alert(message)
      }
    } else {
      console.log("❌ Speech Recognition not supported")
      setSpeechSupported(false)
    }
  }, [voiceMode])

  const speak = (text) => {
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

  const startListening = async () => {
    console.log("🔴 Start listening button clicked")
    if (!speechSupported) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
      return
    }

    if (!recognitionRef.current) {
      alert("Speech recognition not initialized.")
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
      alert("Failed to start speech recognition. Please try again.")
    }
  }

  const handleStart = () => {
    setIsRecording(true)
    setDisplayContent(inputValue)

    if (voiceMode && inputValue.trim()) {
      speak(`Recording started. Your content: ${inputValue}`)
    }
  }

  const handleStop = () => {
    setIsRecording(false)

    if (voiceMode) {
      speak("Recording stopped.")
    }
  }

  const handleDone = () => {
    if (displayContent.trim()) {
      setShowCreateItemModal(true)

      if (voiceMode) {
        speak("Opening creation form. Please fill in the details.")
      }
    }
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreate = (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.title.trim() || !formData.category.trim()) {
      alert("Please fill in all required fields")
      return
    }

    // Simulate saving (you can replace this with actual API call)
    console.log("Creating item with data:", {
      ...formData,
      content: displayContent,
      geminiResponse: geminiResponse,
      createdAt: new Date().toISOString(),
    })

    // Reset everything
    setFormData({
      title: "",
      category: "",
      companies: "",
      difficulty: "easy",
    })
    setShowCreateItemModal(false)
    setInputValue("")
    setDisplayContent("")
    setIsRecording(false)
    setGeminiResponse("")
    setTranscript("")

    if (voiceMode) {
      speak("Interview item created successfully!")
    }
  }

  const handleCloseCreateModal = () => {
    setFormData({
      title: "",
      category: "",
      companies: "",
      difficulty: "easy",
    })
    setShowCreateItemModal(false)
  }

  return (
    <div className="interview-container">
      {/* Instructions Modal */}
      {showInstructionsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Welcome to the AI-Powered Interview Creator!</h2>
            </div>
            <div className="modal-content">
              <div className="instructions">
                <p>Follow these simple steps to get started:</p>
                <ul>
                  <li>
                    <strong>Enable Voice Mode</strong> for AI-powered assistance (optional)
                  </li>
                  <li>
                    <strong>Enter your text</strong> in the input field or use voice input
                  </li>
                  <li>
                    Click <strong>"Start"</strong> to begin recording and display your content
                  </li>
                  <li>
                    Click <strong>"Stop"</strong> to pause the recording
                  </li>
                  <li>Review your content and AI responses in the display area</li>
                  <li>
                    When satisfied, click <strong>"Done"</strong> to save your work
                  </li>
                  <li>
                    Fill in the required details and click <strong>"Create"</strong> to complete
                  </li>
                </ul>
                <div className="note">
                  <strong>Note:</strong> Voice mode requires microphone access and works best in Chrome or Edge
                  browsers.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="confirm-button" onClick={() => setShowInstructionsModal(false)}>
                Got it, let's start!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Item Modal */}
      {showCreateItemModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Interview Item</h2>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-content">
                <div className="form-group">
                  <label className="label" htmlFor="title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder="Enter title..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="category">
                    Category <span className="required">*</span>
                  </label>
                  <input
                    id="category"
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                    placeholder="Enter category..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="companies">
                    Companies
                  </label>
                  <input
                    id="companies"
                    type="text"
                    className="form-input"
                    value={formData.companies}
                    onChange={(e) => handleFormChange("companies", e.target.value)}
                    placeholder="Enter companies (comma separated)..."
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="difficulty">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    className="form-select"
                    value={formData.difficulty}
                    onChange={(e) => handleFormChange("difficulty", e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Content Preview</label>
                  <div className="content-preview">{displayContent || "No content to preview"}</div>
                </div>

                {geminiResponse && (
                  <div className="form-group">
                    <label className="label">AI Assistant Response</label>
                    <div className="content-preview ai-response">{geminiResponse}</div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={handleCloseCreateModal}>
                  Cancel
                </button>
                <button type="submit" className="create-button">
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Left Section (Decorative/Placeholder) */}
      <div className="interview-left-section">
        <iframe
          src="https://my.spline.design/voiceinteractionanimation-2TyeWSP24w6QzdGddVpF30we/"
          frameBorder="0"
          width="100%"
          height="100%"
          title="Askora Voice Interaction Animation"
        ></iframe>
      </div>

      {/* Right Section (Main UI) */}
      <div className="interview-right-section">
        <div className="interview-content-wrapper">
          {/* AI Configuration Panel */}
          <div className="ai-config-panel">
            <div className="config-row">
              <div className="config-item">
                <label className="config-label">
                  <input type="checkbox" checked={voiceMode} onChange={(e) => setVoiceMode(e.target.checked)} />
                  <span className="checkmark"></span>
                  Enable Voice Mode & AI Assistance
                </label>
              </div>
            </div>

            {!speechSupported && voiceMode && (
              <div className="warning-message">
                <AlertCircle className="warning-icon" size={16} />
                Speech recognition not supported. Please use Chrome or Edge browser.
              </div>
            )}
          </div>

          {/* Start/Stop Buttons */}
          <div className="button-group">
            <button className={`control-button ${isRecording ? "active-button" : ""}`} onClick={handleStart}>
              Start
            </button>
            <button
              className={`control-button ${!isRecording ? "disabled-button" : ""}`}
              onClick={handleStop}
              disabled={!isRecording}
            >
              Stop
            </button>
          </div>

          {/* Input Section with Voice Controls */}
          <div className="input-section">
            {voiceMode && speechSupported && (
              <div className="voice-controls">
                <button className={`voice-button ${isListening ? "listening" : ""}`} onClick={startListening}>
                  {isListening ? (
                    <>
                      <MicOff size={20} />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      Start Voice Input
                    </>
                  )}
                </button>

                {isSpeaking && (
                  <button
                    className="voice-button stop-speaking"
                    onClick={() => window.speechSynthesis && window.speechSynthesis.cancel()}
                  >
                    <VolumeX size={20} />
                    Stop AI Voice
                  </button>
                )}

                {isListening && (
                  <div className="listening-indicator">
                    <div className="pulse-dot"></div>
                    <span>Listening...</span>
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              placeholder={voiceMode ? "Type here or use voice input..." : "Enter text here..."}
              className="main-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            {transcript && (
              <div className="transcript-display">
                <span className="transcript-label">Voice Input:</span>
                <span className="transcript-text">"{transcript}"</span>
              </div>
            )}
          </div>

          {/* AI Response Section */}
          {voiceMode && (transcript || isGeminiLoading || geminiResponse) && (
            <div className="ai-response-section">
              <div className="ai-response-header">
                <Sparkles className="ai-icon" size={20} />
                <span>AI Assistant Response</span>
              </div>

              {isGeminiLoading ? (
                <div className="loading-response">
                  <Loader2 className="loading-spinner" size={20} />
                  <span>Getting response from AI...</span>
                </div>
              ) : geminiResponse ? (
                <div className="ai-response-content">{geminiResponse}</div>
              ) : null}
            </div>
          )}

          {/* Display Div */}
          <div className="display-div">
            <div className="display-content">{displayContent || "Your content will appear here..."}</div>
            <button
              className={`done-button ${!displayContent ? "disabled-button" : ""}`}
              onClick={handleDone}
              disabled={!displayContent}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceRe

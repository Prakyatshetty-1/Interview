import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, VolumeX, Loader2, Play } from "lucide-react";

// Define the static interview questions
const interviewQuestions = [
  "Tell me about yourself.",
  "Why are you interested in this position?",
  "What are your greatest strengths?",
  "What are your greatest weaknesses?",
  "Where do you see yourself in five years?",
];

// Google Gemini API configuration
const GOOGLE_API_KEY = "AIzaSyBPLTvb7mPD7BBJZhAZDWu4_1XGCdCQpRk";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GOOGLE_API_KEY}`;

export default function InterviewPortal() {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userAnswerText, setUserAnswerText] = useState("");
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  
  // Effect to initialize Speech Recognition and Speech Synthesis
  useEffect(() => {
    // Initialize SpeechRecognition
    if (
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    ) {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setUserAnswerText(speechResult);
        setIsListening(false);
        setTranscript((prev) => [
          ...prev,
          { type: "answer", text: speechResult },
        ]);
        processUserAnswer(speechResult);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setError(
            "Microphone access denied. Please allow microphone access in your browser settings."
          );
        } else if (event.error === "no-speech") {
          setError("No speech detected. Please try again.");
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          setIsListening(false);
        }
      };
    }

    // Initialize SpeechSynthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Add general checks for both APIs
    if (typeof window !== "undefined") {
      if (
        !(window.SpeechRecognition || window.webkitSpeechRecognition) &&
        !("speechSynthesis" in window)
      ) {
        setError(
          "Neither Speech Recognition nor Speech Synthesis is supported. Please use Google Chrome for the best experience."
        );
      } else if (
        !(window.SpeechRecognition || window.webkitSpeechRecognition)
      ) {
        setError(
          "Speech Recognition is not supported. Please use Google Chrome for the best experience."
        );
      } else if (!("speechSynthesis" in window)) {
        setError(
          "Speech Synthesis is not supported. Voice feedback will not be available."
        );
      }
    }
  }, [isListening]);

  const callGeminiAPI = async (question, answer) => {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional job interviewer. The candidate was asked: "${question}". Their answer was: "${answer}". Provide constructive feedback on this answer in 3-4 sentences, focusing on strengths and areas for improvement. Keep your feedback concise and helpful. Do not ask the next question.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        console.error("Unexpected API response structure:", data);
        throw new Error("Invalid response from AI service");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      if (error.message.includes("404")) {
        throw new Error(
          "AI service temporarily unavailable. Please try again later."
        );
      }
      throw error;
    }
  };

  const speakText = (text, onEndCallback) => {
    if (!synthRef.current) {
      console.warn("Speech Synthesis API not supported. Cannot speak text.");
      onEndCallback?.();
      return;
    }

    setIsSpeaking(true);
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => {
      setIsSpeaking(false);
      onEndCallback?.();
    };
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
      onEndCallback?.();
    };
    synthRef.current.speak(utterance);
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setTranscript([]);
    setFeedback("");
    setUserAnswerText("");
    setError("");
    askQuestion(0);
  };

  const askQuestion = (index) => {
    if (index < interviewQuestions.length) {
      const question = interviewQuestions[index];
      setTranscript((prev) => [...prev, { type: "question", text: question }]);
      speakText(question, () => {
        startListening();
      });
    } else {
      const completionMessage = "Interview completed! Thank you for your time.";
      setTranscript((prev) => [
        ...prev,
        { type: "feedback", text: completionMessage },
      ]);
      speakText(completionMessage, () => {
        setInterviewStarted(false);
      });
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setUserAnswerText("Listening...");
        setError("");
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setIsListening(false);
        setError(
          "Failed to start microphone. Please ensure microphone access is granted and try again."
        );
      }
    } else if (!recognitionRef.current) {
      setError("Speech Recognition is not available in your browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processUserAnswer = async (answer) => {
    setIsLoadingLLM(true);
    setFeedback("");
    setError("");

    try {
      const llmFeedback = await callGeminiAPI(
        interviewQuestions[currentQuestionIndex],
        answer
      );
      setFeedback(llmFeedback);
      setTranscript((prev) => [
        ...prev,
        { type: "feedback", text: llmFeedback },
      ]);

      speakText(llmFeedback, () => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        askQuestion(nextIndex);
      });
    } catch (error) {
      console.error("Error processing user answer with LLM:", error);
      const errorMessage = `There was an error processing your answer: ${
        error.message || "Please try again."
      }`;
      setFeedback(errorMessage);
      setTranscript((prev) => [
        ...prev,
        { type: "feedback", text: errorMessage },
      ]);
      speakText(errorMessage, () => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        askQuestion(nextIndex);
      });
    } finally {
      setIsLoadingLLM(false);
    }
  };

  return (
    <div className="askora-interview-portal">
      <div className="askora-interview-card">
        {/* Left Panel - Iframe */}
        <div className="askora-left-panel">
           <div className="askora-logo-container">
        <span className="askora-logo">Askora</span>
      </div>
       <div className="pricing-bg-orbs">
            <div className="pricing-orb pricing-orb1"></div>
            <div className="pricing-orb pricing-orb3"></div>
            <div className="pricing-orb pricing-orb4"></div>
            <div className="pricing-orb pricing-orb5"></div>
          </div>

          {/* Enhanced Particle Wave Orb */}
          <div className={`particle-orb-container ${isSpeaking ? 'active' : ''}`}>
            {/* Central energy core */}
            <div className="energy-core"></div>
            
            {/* Multi-layered particle system */}
            <div className="particle-layer layer-1">
              {Array.from({length: 8}).map((_, i) => (
                <div key={`layer1-${i}`} className={`particle particle-layer-1 particle-${i + 1}`}></div>
              ))}
            </div>
            
            <div className="particle-layer layer-2">
              {Array.from({length: 12}).map((_, i) => (
                <div key={`layer2-${i}`} className={`particle particle-layer-2 particle-${i + 9}`}></div>
              ))}
            </div>
            
            <div className="particle-layer layer-3">
              {Array.from({length: 16}).map((_, i) => (
                <div key={`layer3-${i}`} className={`particle particle-layer-3 particle-${i + 21}`}></div>
              ))}
            </div>
            
            {/* Floating energy particles */}
            <div className="floating-particles">
              {Array.from({length: 20}).map((_, i) => (
                <div key={`float-${i}`} className={`floating-particle float-${i + 1}`}></div>
              ))}
            </div>
            
            {/* Dynamic pulse waves */}
            <div className="pulse-wave wave-1"></div>
            <div className="pulse-wave wave-2"></div>
            <div className="pulse-wave wave-3"></div>
            <div className="pulse-wave wave-4"></div>
            
            {/* Energy beams */}
            <div className="energy-beam beam-1"></div>
            <div className="energy-beam beam-2"></div>
            <div className="energy-beam beam-3"></div>
            <div className="energy-beam beam-4"></div>
          </div>

          <iframe
            src="https://my.spline.design/voiceinteractionanimation-2TyeWSP24w6QzdGddVpF30we/"
            frameBorder="0"
            width="100%"
            height="100%"
            title="Askora Voice Interaction Animation"
            className="askora-iframe"
          />
        </div>

        {/* Right Panel - Interview Content */}
        <div className="askora-right-panel">
          {error && <div className="askora-error-message">{error}</div>}

          {!interviewStarted ? (
            <div className="askora-start-section">
              <h1 className="askora-title">Askora Interview Portal</h1>
              <p className="askora-instructions">
                Click "Start Interview" to begin. Askora will ask you 5
                questions, provide feedback, and then move to the next
                question.
              </p>
              <button
                onClick={startInterview}
                className="askora-btn askora-btn-primary askora-btn-large"
              >
                <Play className="askora-icon" />
                Start Interview
              </button>
            </div>
          ) : (
            <div className="askora-interview-section">
              {/* Question and Feedback Box */}
              <div className="askora-question-panel">
                <h2 className="askora-question-title">
                  {currentQuestionIndex < interviewQuestions.length
                    ? `Question ${currentQuestionIndex + 1}/${
                        interviewQuestions.length
                      }:`
                    : "Interview Completed!"}
                </h2>
                {currentQuestionIndex < interviewQuestions.length && (
                  <p className="askora-question-text">
                    {interviewQuestions[currentQuestionIndex]}
                  </p>
                )}

                {feedback && (
                  <div className="askora-feedback-section">
                    <span className="askora-label">Feedback:</span>
                    <p className="askora-feedback-text">{feedback}</p>
                  </div>
                )}

                {userAnswerText && userAnswerText !== "Listening..." && (
                  <div className="askora-answer-section">
                    <span className="askora-label">Your Answer:</span>
                    <p className="askora-answer-text">{userAnswerText}</p>
                  </div>
                )}

                {userAnswerText === "Listening..." && (
                  <div className="askora-listening-indicator">
                    <span className="askora-pulse"></span>
                    Listening for your response...
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="askora-controls">
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={
                    isSpeaking ||
                    isLoadingLLM ||
                    currentQuestionIndex >= interviewQuestions.length ||
                    !recognitionRef.current
                  }
                  className={`askora-btn ${
                    isListening ? "askora-btn-danger" : "askora-btn-primary"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="askora-icon" /> Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="askora-icon" /> Start Listening
                    </>
                  )}
                </button>

                <button
                  onClick={() => synthRef.current?.cancel()}
                  disabled={!isSpeaking || !synthRef.current}
                  className="askora-btn askora-btn-secondary"
                >
                  <VolumeX className="askora-icon" /> Stop Speaking
                </button>
              </div>

              {isLoadingLLM && (
                <div className="askora-loading">
                  <Loader2 className="askora-icon askora-spin" />
                  Processing your answer...
                </div>
              )}

              {/* Transcript Box */}
              <div className="askora-transcript-section">
                <h3 className="askora-transcript-title">Interview Transcript</h3>
                <div className="askora-transcript-container">
                  {transcript.length === 0 && (
                    <p className="askora-empty-transcript">No transcript yet.</p>
                  )}
                  {transcript.map((entry, index) => (
                    <div
                      key={index}
                      className={`askora-transcript-entry askora-transcript-${entry.type}`}
                    >
                      <strong>
                        {entry.type === "question"
                          ? "Interviewer"
                          : entry.type === "answer"
                          ? "You"
                          : "Feedback"}
                        :
                      </strong>{" "}
                      {entry.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .askora-interview-portal {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .askora-interview-portal .askora-iframe {
          width: 120% !important;
          height: 120% !important;
          border: none !important;
          outline: none !important;
          display: block !important;
          flex-shrink: 0;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          background: transparent;
          z-index:999 !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          overflow: visible !important;
          flex: none !important;
        }

        .askora-interview-card {
          width: 100%;
          height: 100%;
          display: flex;
          overflow: hidden;
        }

        .askora-left-panel {
          width: 50%;
          background-color: rgba(15, 16, 31, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .askora-right-panel {
          width: 50%;
          padding: 2rem;
          overflow-y: auto;
          background: rgba(33, 36, 68, 0.6);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Enhanced Particle Orb System */
        .particle-orb-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 25;
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          width: 500px;
          height: 500px;
        }

        .particle-orb-container.active {
          opacity: 1;
        }

        /* Central Energy Core */
        .energy-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #ffffff, #4f46e5, #7c3aed);
          border-radius: 50%;
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 40px rgba(79, 70, 229, 0.6),
            0 0 60px rgba(124, 58, 237, 0.4);
          animation: coreEnergy 2s ease-in-out infinite;
        }

        @keyframes coreEnergy {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 
              0 0 20px rgba(255, 255, 255, 0.8),
              0 0 40px rgba(79, 70, 229, 0.6),
              0 0 60px rgba(124, 58, 237, 0.4);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 1),
              0 0 60px rgba(79, 70, 229, 0.8),
              0 0 90px rgba(124, 58, 237, 0.6);
          }
        }

        /* Particle Layers */
        .particle-layer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          animation: orbitalDance 4s ease-in-out infinite;
        }

        /* Layer 1 - Inner orbit particles */
        .particle-layer-1 {
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, #ffffff, #4f46e5);
          box-shadow: 0 0 12px rgba(79, 70, 229, 0.9);
        }

        .layer-1 .particle-1 { top: 50%; left: 60%; animation-delay: 0s; transform-origin: -60px center; }
        .layer-1 .particle-2 { top: 35%; left: 57%; animation-delay: 0.5s; transform-origin: -57px center; }
        .layer-1 .particle-3 { top: 25%; left: 50%; animation-delay: 1s; transform-origin: -50px center; }
        .layer-1 .particle-4 { top: 35%; left: 43%; animation-delay: 1.5s; transform-origin: -43px center; }
        .layer-1 .particle-5 { top: 50%; left: 40%; animation-delay: 2s; transform-origin: -40px center; }
        .layer-1 .particle-6 { top: 65%; left: 43%; animation-delay: 2.5s; transform-origin: -43px center; }
        .layer-1 .particle-7 { top: 75%; left: 50%; animation-delay: 3s; transform-origin: -50px center; }
        .layer-1 .particle-8 { top: 65%; left: 57%; animation-delay: 3.5s; transform-origin: -57px center; }

        /* Layer 2 - Middle orbit particles */
        .particle-layer-2 {
          width: 5px;
          height: 5px;
          background: radial-gradient(circle, #7c3aed, #ec4899);
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.8);
        }

        .layer-2 .particle-9 { top: 50%; left: 75%; animation-delay: 0.2s; transform-origin: -125px center; }
        .layer-2 .particle-10 { top: 25%; left: 68%; animation-delay: 0.7s; transform-origin: -118px center; }
        .layer-2 .particle-11 { top: 15%; left: 50%; animation-delay: 1.2s; transform-origin: -100px center; }
        .layer-2 .particle-12 { top: 25%; left: 32%; animation-delay: 1.7s; transform-origin: -82px center; }
        .layer-2 .particle-13 { top: 50%; left: 25%; animation-delay: 2.2s; transform-origin: -75px center; }
        .layer-2 .particle-14 { top: 75%; left: 32%; animation-delay: 2.7s; transform-origin: -82px center; }
        .layer-2 .particle-15 { top: 85%; left: 50%; animation-delay: 3.2s; transform-origin: -100px center; }
        .layer-2 .particle-16 { top: 75%; left: 68%; animation-delay: 3.7s; transform-origin: -118px center; }
        .layer-2 .particle-17 { top: 40%; left: 80%; animation-delay: 0.4s; transform-origin: -130px center; }
        .layer-2 .particle-18 { top: 35%; left: 20%; animation-delay: 0.9s; transform-origin: -70px center; }
        .layer-2 .particle-19 { top: 65%; left: 20%; animation-delay: 1.4s; transform-origin: -70px center; }
        .layer-2 .particle-20 { top: 60%; left: 80%; animation-delay: 1.9s; transform-origin: -130px center; }

        /* Layer 3 - Outer orbit particles */
        .particle-layer-3 {
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, #ec4899, #f59e0b);
          box-shadow: 0 0 8px rgba(236, 72, 153, 0.7);
        }

        .layer-3 .particle-21 { top: 50%; left: 90%; animation-delay: 0.1s; transform-origin: -190px center; }
        .layer-3 .particle-22 { top: 20%; left: 80%; animation-delay: 0.3s; transform-origin: -180px center; }
        .layer-3 .particle-23 { top: 10%; left: 65%; animation-delay: 0.6s; transform-origin: -165px center; }
        .layer-3 .particle-24 { top: 5%; left: 50%; animation-delay: 0.9s; transform-origin: -150px center; }
        .layer-3 .particle-25 { top: 10%; left: 35%; animation-delay: 1.2s; transform-origin: -135px center; }
        .layer-3 .particle-26 { top: 20%; left: 20%; animation-delay: 1.5s; transform-origin: -120px center; }
        .layer-3 .particle-27 { top: 35%; left: 8%; animation-delay: 1.8s; transform-origin: -108px center; }
        .layer-3 .particle-28 { top: 50%; left: 5%; animation-delay: 2.1s; transform-origin: -105px center; }
        .layer-3 .particle-29 { top: 65%; left: 8%; animation-delay: 2.4s; transform-origin: -108px center; }
        .layer-3 .particle-30 { top: 80%; left: 20%; animation-delay: 2.7s; transform-origin: -120px center; }
        .layer-3 .particle-31 { top: 90%; left: 35%; animation-delay: 3s; transform-origin: -135px center; }
        .layer-3 .particle-32 { top: 95%; left: 50%; animation-delay: 3.3s; transform-origin: -150px center; }
        .layer-3 .particle-33 { top: 90%; left: 65%; animation-delay: 3.6s; transform-origin: -165px center; }
        .layer-3 .particle-34 { top: 80%; left: 80%; animation-delay: 3.9s; transform-origin: -180px center; }
        .layer-3 .particle-35 { top: 65%; left: 92%; animation-delay: 0.15s; transform-origin: -192px center; }
        .layer-3 .particle-36 { top: 35%; left: 92%; animation-delay: 0.45s; transform-origin: -192px center; }

        @keyframes orbitalDance {
          0% {
            transform: rotate(0deg) translateX(0px) scale(0.8);
            opacity: 0.6;
          }
          25% {
            transform: rotate(90deg) translateX(12px) scale(1.4);
            opacity: 1;
          }
          50% {
            transform: rotate(180deg) translateX(0px) scale(1.1);
            opacity: 0.8;
          }
          75% {
            transform: rotate(270deg) translateX(-12px) scale(1.4);
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) translateX(0px) scale(0.8);
            opacity: 0.6;
          }
        }

        /* Floating Energy Particles */
        .floating-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .floating-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: radial-gradient(circle, #ffffff, transparent);
          border-radius: 50%;
          animation: floatAround 6s linear infinite;
        }

        .floating-particle:nth-child(odd) {
          background: radial-gradient(circle, #4f46e5, transparent);
        }

        .floating-particle:nth-child(3n) {
          background: radial-gradient(circle, #ec4899, transparent);
        }

        /* Randomized floating positions */
        .float-1 { top: 20%; left: 30%; animation-delay: 0s; }
        .float-2 { top: 80%; left: 70%; animation-delay: 0.3s; }
        .float-3 { top: 40%; left: 10%; animation-delay: 0.6s; }
        .float-4 { top: 60%; left: 90%; animation-delay: 0.9s; }
        .float-5 { top: 15%; left: 75%; animation-delay: 1.2s; }
        .float-6 { top: 85%; left: 25%; animation-delay: 1.5s; }
        .float-7 { top: 50%; left: 5%; animation-delay: 1.8s; }
        .float-8 { top: 30%; left: 95%; animation-delay: 2.1s; }
        .float-9 { top: 70%; left: 15%; animation-delay: 2.4s; }
        .float-10 { top: 25%; left: 55%; animation-delay: 2.7s; }
        .float-11 { top: 75%; left: 45%; animation-delay: 3s; }
        .float-12 { top: 10%; left: 40%; animation-delay: 3.3s; }
        .float-13 { top: 90%; left: 60%; animation-delay: 3.6s; }
        .float-14 { top: 45%; left: 85%; animation-delay: 3.9s; }
        .float-15 { top: 55%; left: 35%; animation-delay: 4.2s; }
        .float-16 { top: 35%; left: 65%; animation-delay: 4.5s; }
        .float-17 { top: 65%; left: 50%; animation-delay: 4.8s; }
        .float-18 { top: 18%; left: 18%; animation-delay: 5.1s; }
        .float-19 { top: 82%; left: 82%; animation-delay: 5.4s; }
        .float-20 { top: 50%; left: 50%; animation-delay: 5.7s; }

        @keyframes floatAround {
          0%, 100% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translate(20px, -30px) scale(1);
            opacity: 1;
          }
          40% {
            transform: translate(-15px, -60px) scale(0.8);
            opacity: 0.7;
          }
          60% {
            transform: translate(-40px, -20px) scale(1.2);
            opacity: 1;
          }
          80% {
            transform: translate(10px, 15px) scale(0.6);
            opacity: 0.5;
          }
        }

        /* Dynamic Pulse Waves */
        .pulse-wave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid transparent;
          animation: pulseWave 3s ease-out infinite;
        }

        .wave-1 {
          width: 100px;
          height: 100px;
          animation-delay: 0s;
          border-color: rgba(79, 70, 229, 0.6);
        }

        .wave-2 {
          width: 180px;
          height: 180px;
          animation-delay: 0.8s;
          border-color: rgba(124, 58, 237, 0.5);
        }

        .wave-3 {
          width: 260px;
          height: 260px;
          animation-delay: 1.6s;
          border-color: rgba(236, 72, 153, 0.4);
        }

        .wave-4 {
          width: 340px;
          height: 340px;
          animation-delay: 2.4s;
          border-color: rgba(245, 158, 11, 0.3);
        }

        @keyframes pulseWave {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
            border-width: 3px;
          }
          30% {
            opacity: 1;
            border-width: 2px;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
            border-width: 1px;
          }
        }

        /* Energy Beams */
        .energy-beam {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center;
          width: 2px;
          height: 150px;
          background: linear-gradient(to top, transparent, rgba(79, 70, 229, 0.8), transparent);
          animation: energyBeam 4s linear infinite;
        }

        .beam-1 {
          transform: translate(-50%, -50%) rotate(0deg);
          animation-delay: 0s;
        }

        .beam-2 {
          transform: translate(-50%, -50%) rotate(90deg);
          animation-delay: 1s;
          background: linear-gradient(to top, transparent, rgba(124, 58, 237, 0.8), transparent);
        }

        .beam-3 {
          transform: translate(-50%, -50%) rotate(45deg);
          animation-delay: 2s;
          background: linear-gradient(to top, transparent, rgba(236, 72, 153, 0.8), transparent);
        }

        .beam-4 {
          transform: translate(-50%, -50%) rotate(135deg);
          animation-delay: 3s;
          background: linear-gradient(to top, transparent, rgba(245, 158, 11, 0.8), transparent);
        }

        @keyframes energyBeam {
          0%, 90%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scaleY(0.5);
          }
          10%, 80% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scaleY(1);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) scaleY(1.2);
          }
        }

        .askora-error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 15px;
          border-radius: 10px;
        }

        .askora-start-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .askora-title {
          font-size: 2rem;
          font-weight: 500;
          color: white;
          margin-bottom: 1rem;
        }

        .askora-instructions {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
          max-width: 400px;
        }

        .askora-interview-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
        }

        .askora-question-panel {
          background:rgba(15, 16, 31, 0.6) ;
          border: 1px solid rgba(15, 16, 31, 0.6);
          border-radius: 15px;
          padding: 1.5rem;
          flex: 0 0 auto;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .askora-question-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #5c6e86ff;
          margin: 0 0 15px 0;
        }

        .askora-question-text {
          font-size: 1.1rem;
          color: #475569;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .askora-feedback-section,
        .askora-answer-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #475569;
        }

        .askora-label {
          font-weight: 600;
          color: #475569;
        }

        .askora-feedback-text {
          color: #7c3aed;
          margin: 10px 0 0 0;
          line-height: 1.6;
        }

        .askora-answer-text {
          color: #059669;
          margin: 10px 0 0 0;
          line-height: 1.6;
        }

        .askora-listening-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #3b82f6;
          font-weight: 500;
          margin-top: 20px;
        }

        .askora-logo-container {
          position: absolute;
          top: 2rem;
          left: 2rem;
          z-index: 30;
        }

        .askora-logo {
          font-size: 28px;
          font-weight: 500;
          color: white;
          flex: 1;
        }

        .askora-pulse {
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border-radius: 50%;
          animation: askora-pulse 1.5s infinite;
        }

        @keyframes askora-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .askora-controls {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
          flex: 0 0 auto;
        }

        .askora-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .askora-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .askora-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
        }

        .askora-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
        }

        .askora-btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .askora-btn-danger:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
        }

        .askora-btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .askora-btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .askora-btn-large {
          padding: 16px 32px;
          font-size: 1.2rem;
        }

        .askora-icon {
          width: 20px;
          height: 20px;
        }

        .askora-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #6b7280;
          font-weight: 500;
          flex: 0 0 auto;
        }

        .askora-spin {
          animation: askora-spin 1s linear infinite;
        }

        @keyframes askora-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .askora-transcript-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .askora-transcript-title {
          font-size: 1.2rem;
          font-weight: 500;
          color: #5c6e88ff;
          margin: 0 0 15px 0;
        }

        .askora-transcript-container {
          background: rgba(15, 16, 31, 0.73);
          border: 1px solid rgba(8, 9, 17, 1);
          border-radius: 10px;
          padding: 20px;
          flex: 1;
          overflow-y: auto;
          min-height: 200px;
        }

        .askora-empty-transcript {
          color: #9ca3af;
          text-align: center;
          margin: 0;
        }

        .askora-transcript-entry {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
          line-height: 1.5;
        }

        .askora-transcript-question {
          background:rgba(33, 36, 68, 0.6) ;
          color: #8b5cf6;
          border-left: 4px solid #8b5cf6;
        }

        .askora-transcript-answer {
          background: #d1fae5;
          color: #065f46;
          border-left: 4px solid #10b981;
        }

        .askora-transcript-feedback {
          background: #f3e8ffff;
          color: #6b21a8;
          border-left: 4px solid #8b5cf6;
        }

        @media (max-width: 768px) {
          .askora-interview-portal {
            padding: 10px;
          }

          .askora-interview-card {
            flex-direction: column;
            height: 90vh;
          }

          .askora-left-panel,
          .askora-right-panel {
            width: 100%;
          }

          .askora-left-panel {
            height: 40%;
          }

          .askora-right-panel {
            height: 60%;
            padding: 1rem;
          }

          .askora-title {
            font-size: 1.5rem;
          }

          .askora-controls {
            flex-direction: column;
            align-items: center;
          }

          .askora-btn {
            width: 100%;
            max-width: 250px;
            justify-content: center;
          }

          .particle-orb-container {
            width: 350px;
            height: 350px;
          }

          .energy-core {
            width: 15px;
            height: 15px;
          }

          .particle-layer-1 {
            width: 4px;
            height: 4px;
          }

          .particle-layer-2 {
            width: 3px;
            height: 3px;
          }

          .particle-layer-3 {
            width: 2px;
            height: 2px;
          }

          .floating-particle {
            width: 1.5px;
            height: 1.5px;
          }

          .energy-beam {
            width: 1px;
            height: 100px;
          }

          .wave-1 { width: 80px; height: 80px; }
          .wave-2 { width: 140px; height: 140px; }
          .wave-3 { width: 200px; height: 200px; }
          .wave-4 { width: 260px; height: 260px; }
        }
      `}</style>
    </div>
  );
}
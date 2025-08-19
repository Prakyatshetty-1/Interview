"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  ChevronDown,
  X,
} from "lucide-react";
import "./CreateInterview.css";

// Simple Toast hook replacement
const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      alert(`${title}: ${description}`);
    },
  };
};

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
  const baseClass = "btn-base";
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "lg" ? "btn-lg" : "btn-default-size";
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
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`card-header ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`card-title ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`card-content ${className}`}>{children}</div>
);
const Input = ({ className = "", ...props }) => (
  <input className={`input ${className}`} {...props} />
);
const Label = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`label ${className}`}>
    {children}
  </label>
);

const Select = ({
  value,
  onValueChange,
  children,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  const options = React.Children.toArray(children).map((child) => ({
    value: child.props.value,
    label: child.props.children,
  }));

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    onValueChange && onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="select-container">
      <button
        type="button"
        className="select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={selectedOption ? "select-value" : "select-placeholder"}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="chevron-icon" />
      </button>
      {isOpen && (
        <div className="select-content">
          {options.map((option) => (
            <div
              key={option.value}
              className="select-item"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SelectItem = ({ value, children }) => {
  return React.createElement("div", { value }, children);
};

const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea className={`textarea ${className}`} rows={rows} {...props} />
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantClass = `badge-${variant}`;
  return <div className={`badge ${variantClass} ${className}`}>{children}</div>;
};

// Main Component with ElevenLabs Integration
export default function CreateInterview() {
  const [step, setStep] = useState("initial");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [showVoiceConfirmation, setShowVoiceConfirmation] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false); // Added for tags dropdown
  const [interviewDetails, setInterviewDetails] = useState({
    title: "",
    category: "",
    difficulty: "",
    duration: "",
    description: "",
    tags: [], // Changed from string to array
  });

  // Define tags for each category
  const categoryTags = {
    All: [
      "General",
      "Communication",
      "Problem Solving",
      "Leadership",
      "Teamwork",
      "Analytical",
      "Creative",
      "Technical",
    ],
    Accounting: [
      "Financial Reporting",
      "Tax Preparation",
      "Auditing",
      "Bookkeeping",
      "QuickBooks",
      "Excel",
      "GAAP",
      "Budget Analysis",
    ],
    "AI Researcher": [
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "Python",
      "TensorFlow",
      "PyTorch",
      "Computer Vision",
      "NLP",
      "Research",
    ],
    "Aerospace Engineer": [
      "Aircraft Design",
      "Propulsion",
      "Aerodynamics",
      "MATLAB",
      "CAD",
      "Flight Dynamics",
      "Materials Science",
      "Systems Engineering",
    ],
    "Application Security Engineer": [
      "OWASP",
      "Penetration Testing",
      "Vulnerability Assessment",
      "Secure Coding",
      "SAST",
      "DAST",
      "Threat Modeling",
      "Security Audits",
    ],
    "Back End": [
      "Node.js",
      "Python",
      "Java",
      "Database Design",
      "API Development",
      "Microservices",
      "Docker",
      "Kubernetes",
      "SQL",
    ],
    "Chemical Engineer": [
      "Process Design",
      "Chemical Reactions",
      "Process Safety",
      "ASPEN",
      "Heat Transfer",
      "Mass Transfer",
      "Process Control",
      "Plant Design",
    ],
    "Civil Engineer": [
      "Structural Design",
      "AutoCAD",
      "Project Management",
      "Construction",
      "Geotechnical",
      "Transportation",
      "Water Resources",
      "Surveying",
    ],
    "Cloud Engineer": [
      "AWS",
      "Azure",
      "GCP",
      "Terraform",
      "Kubernetes",
      "Docker",
      "CI/CD",
      "Infrastructure as Code",
      "Monitoring",
    ],
    "Cyber Security": [
      "Network Security",
      "Incident Response",
      "Risk Assessment",
      "Compliance",
      "Firewall",
      "IDS/IPS",
      "SIEM",
      "Forensics",
    ],
    "Data Engineer": [
      "ETL",
      "Apache Spark",
      "Kafka",
      "Data Warehousing",
      "SQL",
      "Python",
      "Airflow",
      "Big Data",
      "Data Pipeline",
    ],
    "Data Scientist": [
      "Python",
      "R",
      "Statistics",
      "Machine Learning",
      "Data Visualization",
      "Pandas",
      "NumPy",
      "Jupyter",
      "SQL",
    ],
    "Desktop Dev": [
      "C#",
      "WPF",
      ".NET",
      "Java Swing",
      "Electron",
      "Qt",
      "GUI Development",
      "Windows API",
      "Cross-platform",
    ],
    "DevOps Engineer": [
      "Docker",
      "Kubernetes",
      "Jenkins",
      "CI/CD",
      "Monitoring",
      "Infrastructure as Code",
      "Git",
      "Linux",
      "Automation",
    ],
    "Electrical Engineering": [
      "Circuit Design",
      "PCB Design",
      "Signal Processing",
      "Power Electronics",
      "Control Systems",
      "MATLAB",
      "Simulation",
      "Testing",
    ],
    "Electronics Engineer": [
      "Embedded Systems",
      "Microcontrollers",
      "FPGA",
      "Circuit Analysis",
      "PCB Layout",
      "Hardware Testing",
      "Firmware",
      "Sensors",
    ],
    "Front End": [
      "React",
      "JavaScript",
      "HTML",
      "CSS",
      "TypeScript",
      "Vue.js",
      "Angular",
      "Responsive Design",
      "UI/UX",
    ],
    "Full Stack": [
      "React",
      "Node.js",
      "JavaScript",
      "Database Design",
      "API Development",
      "TypeScript",
      "MongoDB",
      "PostgreSQL",
      "Git",
    ],
    "Game Development": [
      "Unity",
      "Unreal Engine",
      "C#",
      "C++",
      "Game Design",
      "3D Modeling",
      "Physics",
      "AI Programming",
      "Multiplayer",
    ],
    "ML Engineer": [
      "Python",
      "TensorFlow",
      "PyTorch",
      "MLOps",
      "Model Deployment",
      "Feature Engineering",
      "A/B Testing",
      "Kubernetes",
      "Docker",
    ],
    "Mechanical Engineering": [
      "CAD Design",
      "SolidWorks",
      "Thermodynamics",
      "Manufacturing",
      "Materials Science",
      "FEA",
      "Project Management",
      "Quality Control",
    ],
    "Mobile Dev": [
      "React Native",
      "Flutter",
      "iOS",
      "Android",
      "Swift",
      "Kotlin",
      "Mobile UI",
      "App Store",
      "Cross-platform",
    ],
    "Robotics Engineer": [
      "ROS",
      "Python",
      "C++",
      "Computer Vision",
      "Sensors",
      "Actuators",
      "Control Systems",
      "Path Planning",
      "Machine Learning",
    ],
    "Security Engineer": [
      "Network Security",
      "Penetration Testing",
      "Risk Assessment",
      "Security Architecture",
      "Compliance",
      "Incident Response",
      "Vulnerability Management",
    ],
    "Site Reliability Engineer": [
      "Monitoring",
      "Incident Response",
      "Automation",
      "Kubernetes",
      "Docker",
      "Linux",
      "Performance Tuning",
      "On-call",
      "SLA/SLO",
    ],
  };

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const { toast } = useToast();

  // Replace this with your actual API key
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY; // You can set this directly or get it from your config

  // Default ElevenLabs configuration (no longer changeable by user)
  const elevenLabsConfig = {
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice (default)
    stability: 0.5,
    clarity: 0.75,
  };

  // Get available tags based on selected category
  const availableTags = categoryTags[interviewDetails.category] || [];

  // Handle tag selection
  const handleTagToggle = (tag) => {
    setInterviewDetails((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Remove selected tag
  const removeTag = (tagToRemove) => {
    setInterviewDetails((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      console.log("✅ Speech Recognition is supported");

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        console.log("🎤 Speech recognition started");
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0].transcript;
        console.log("🗣️ Speech result:", result);
        setTranscript(result);
        handleVoiceInput(result);
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 Speech recognition ended");
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("❌ Speech recognition error:", event.error);
        setIsListening(false);
        let message = "Speech recognition failed. ";
        switch (event.error) {
          case "not-allowed":
            message += "Please allow microphone access.";
            break;
          case "no-speech":
            message += "No speech was detected. Try again.";
            break;
          case "network":
            message += "Network error occurred.";
            break;
          default:
            message += "Please try again.";
        }
        toast({
          title: "Speech Error",
          description: message,
          variant: "destructive",
        });
      };
    } else {
      console.log("❌ Speech Recognition not supported");
      setSpeechSupported(false);
    }
  }, [toast]);

  // ElevenLabs Text-to-Speech function
  const speakWithElevenLabs = async (text) => {
    if (
      !ELEVENLABS_API_KEY ||
      ELEVENLABS_API_KEY === "your_elevenlabs_api_key_here"
    ) {
      console.warn(
        "ElevenLabs API key not configured, falling back to browser TTS"
      );
      speakWithBrowserTTS(text);
      return;
    }

    try {
      setIsSpeaking(true);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsConfig.voiceId}`,
        {
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
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("ElevenLabs TTS Error:", error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowserTTS(text);
    }
  };

  // Browser TTS fallback
  const speakWithBrowserTTS = (text) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Main speak function
  const speak = async (text) => {
    if (
      ELEVENLABS_API_KEY &&
      ELEVENLABS_API_KEY !== "your_elevenlabs_api_key_here"
    ) {
      await speakWithElevenLabs(text);
    } else {
      speakWithBrowserTTS(text);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startListening = async () => {
    console.log("🔴 Start listening button clicked");
    if (!speechSupported) {
      toast({
        title: "Not Supported",
        description:
          "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (!recognitionRef.current) {
      toast({
        title: "Error",
        description: "Speech recognition not initialized.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      console.log("🛑 Stopping speech recognition");
      recognitionRef.current.stop();
      return;
    }

    try {
      console.log("🎤 Starting speech recognition...");
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      toast({
        title: "Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceInput = (text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    switch (step) {
      case "asking-count":
        const numbers = cleanText.match(/\d+/g);
        const count = numbers ? Number.parseInt(numbers[0]) : 0;
        if (count > 0 && count <= 20) {
          setTotalQuestions(count);
          setStep("collecting-questions");
          setCurrentQuestionIndex(0);
          setTimeout(() => {
            speak(
              `Perfect! I'll collect ${count} questions. Please tell me your first question.`
            );
          }, 1000);
        } else {
          setTimeout(() => {
            speak("Please say a number between 1 and 20.");
          }, 500);
        }
        break;
      case "collecting-questions":
        setPendingQuestion(cleanText);
        setShowVoiceConfirmation(true);
        break;
    }
  };

  const handleSubmitQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: pendingQuestion,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    const nextIndex = currentQuestionIndex + 1;
    setShowVoiceConfirmation(false);
    setPendingQuestion("");
    setTranscript("");

    if (nextIndex < totalQuestions) {
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => {
        speak(`Got it! Now tell me question number ${nextIndex + 1}.`);
      }, 1000);
    } else {
      setStep("details-form");
      setTimeout(() => {
        speak(
          "Excellent! All questions collected. Please fill out the form below."
        );
      }, 1000);
    }
  };

  const handleRetryQuestion = () => {
    setShowVoiceConfirmation(false);
    setPendingQuestion("");
    setTranscript("");
    setTimeout(() => {
      speak(
        `Let's try again. Please tell me question number ${
          currentQuestionIndex + 1
        }.`
      );
    }, 500);
  };

  const handleTextInput = (text) => {
    if (text.trim()) {
      setTranscript(text);
      if (step === "collecting-questions") {
        const newQuestion = {
          id: Date.now(),
          text: text.trim(),
        };
        setQuestions((prev) => [...prev, newQuestion]);
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < totalQuestions) {
          setCurrentQuestionIndex(nextIndex);
          setTimeout(() => {
            speak(`Got it! Now tell me question number ${nextIndex + 1}.`);
          }, 1000);
        } else {
          setStep("details-form");
          setTimeout(() => {
            speak(
              "Excellent! All questions collected. Please fill out the form below."
            );
          }, 1000);
        }
      } else {
        handleVoiceInput(text);
      }
    }
  };

  const startInterview = () => {
    setStep("greeting");
    setTimeout(() => {
      speak(
        "Hello! Welcome to the Askora Interview creator. I'm here to help you create amazing interview questions using voice or text input. Let's get started!"
      );
    }, 500);
  };

  const proceedToQuestionCount = () => {
    setStep("asking-count");
    setTimeout(() => {
      speak(
        "Great! How many interview questions would you like to create? Please say a number between 1 and 20."
      );
    }, 500);
  };


// CreateInterview.jsx --- replace existing handleDetailsSubmit with this
const handleDetailsSubmit = async () => {
  // Require title, category, difficulty and at least one tag
  if (
    !interviewDetails.title ||
    !interviewDetails.category ||
    !interviewDetails.difficulty ||
    !Array.isArray(interviewDetails.tags) ||
    interviewDetails.tags.length === 0
  ) {
    toast({
      title: "Missing Information",
      description: "Please fill in title, category, difficulty and select at least one tag.",
      variant: "destructive",
    });
    return;
  }

  try {
    const token = localStorage.getItem("token");

    // IMPORTANT: post to backend server (port 5000) route registered in server.cjs:
    // app.use('/api/interviews', interviewRoutes)
    const res = await fetch("http://localhost:5000/api/interviews/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        title: interviewDetails.title,
        category: interviewDetails.category,
        difficulty: interviewDetails.difficulty,
        duration: interviewDetails.duration,
        // send the tags array
        tags: interviewDetails.tags,
        // questions must be an array of objects { question: ..., ... }
        questions: questions.map((q) => ({
          question: q.text,
          category: interviewDetails.category,
          difficulty: interviewDetails.difficulty,
          expectedDuration: interviewDetails.duration || 5,
          // don't set per-question tag unless you want to:
          // tag: interviewDetails.tags[0] || undefined
        })),
      }),
    });

    // handle possible empty response body safely
    let data = {};
    try {
      data = await res.json();
    } catch (err) {
      // empty JSON body or non-JSON response
    }

    if (res.ok) {
      setStep("completed");
      speak("Your interview pack has been created successfully!");
    } else {
      console.error("Save error:", data || { status: res.status });
      toast({
        title: "Save failed",
        description: data.error || "Server error while saving",
        variant: "destructive",
      });
    }
  } catch (err) {
    console.error("Error saving interview:", err);
    toast({
      title: "Network error",
      description: "Could not save interview. Is your backend running on port 5000?",
      variant: "destructive",
    });
  }
};


  const resetInterview = () => {
    setStep("initial");
    setQuestions([]);
    setTotalQuestions(0);
    setCurrentQuestionIndex(0);
    setTranscript("");
    setPendingQuestion("");
    setShowVoiceConfirmation(false);
    setIsTagsOpen(false); // Reset tags dropdown state
    setInterviewDetails({
      title: "",
      category: "",
      difficulty: "",
      duration: "",
      description: "",
      tags: [], // Reset to empty array
    });
    stopSpeaking();
  };

  // AI Assistant Circle Component for left panel with waves
  const AIAssistant = ({ isListening, isSpeaking }) => (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Wave animation behind iframe */}
      <div className="wave-container">
        <div className="circle"></div>
        {(isListening || isSpeaking) && (
          <>
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </>
        )}
      </div>

      {/* Iframe on top */}
      <iframe
        src="https://my.spline.design/voiceinteractionanimation-2TyeWSP24w6QzdGddVpF30we/"
        frameBorder="0"
        width="100%"
        height="100%"
        title="Askora Voice Interaction Animation"
      />
    </div>
  );

  return (
    <div className="createapp-container">
      {/* Hidden audio element for ElevenLabs */}
      <audio ref={audioRef} />

      <div className="split-layout">
        {/* Left Panel - AI Assistant (Dark) */}
        <div className="createleft-panel">
          <div className="logo-container">
            <div className="logo-header">
              <span className="logo">Askora</span>
            </div>
          </div>

          {/* Background orbs */}
          <div className="pricing-bg-orbs">
            <div className="pricing-orb pricing-orb1"></div>

            <div className="pricing-orb pricing-orb3"></div>
            <div className="pricing-orb pricing-orb4"></div>
            <div className="pricing-orb pricing-orb5"></div>
          </div>

          {step === "initial" ? (
            <div className="createwelcome-screen">
              <h1 className="createmain-heading">Create Interview Pack</h1>
              <p className="createmain-subtitle">
                AI-powered interview question creator
              </p>
              <Button onClick={startInterview} size="lg" className="start-btn">
                <Volume2 className="btn-icon" />
                Start Creating Interview
              </Button>
              {!speechSupported && (
                <div className="warning-alert">
                  <AlertCircle className="warning-icon" />
                  <p className="warning-text">
                    Speech recognition not supported. Please use Chrome or Edge
                    browser.
                  </p>
                </div>
              )}
            </div>
          ) : step === "greeting" ? (
            <div className="welcome-screen">
              <h2 className="greeting-heading">Welcome! 👋</h2>
              <p className="greeting-subtitle">
                I'm your AI interview assistant
              </p>
              <div className="greeting-message">
                <p className="greeting-text">
                  Hello! Welcome to the AI-powered interview creator. I'm here
                  to help you create amazing interview questions using voice or
                  text input.
                </p>
                <p className="greeting-text">
                  I'll guide you through the process step by step. Let's create
                  something great together!
                </p>
              </div>
              <Button
                onClick={proceedToQuestionCount}
                size="lg"
                className="start-btn"
              >
                Let's Get Started!
              </Button>
            </div>
          ) : step === "completed" ? (
            <div className="completion-screen">
              <div className="celebration-icon">🎉</div>
              <h2 className="completion-heading">Interview Pack Created!</h2>
              <p className="completion-subtitle">
                Your interview is ready to use
              </p>
              <div className="completion-actions">
                <Button
                  onClick={resetInterview}
                  variant="outline"
                  size="lg"
                  className="completion-btn bg-transparent"
                >
                  Create Another Interview
                </Button>
                <Button size="lg" variant="success" className="completion-btn">
                  View Interview Pack
                </Button>
              </div>
            </div>
          ) : (
            <AIAssistant isListening={isListening} isSpeaking={isSpeaking} />
          )}
        </div>

        {/* Right Panel - Controls and Forms (Light) */}
        <div className="right-panel">
          {step === "initial" && (
            <div className="right-content-center">
              <Card className="intro-card">
                <CardHeader className="intro-header">
                  <CardTitle className="intro-title">Ready to Start?</CardTitle>
                  <p className="intro-description">
                    Create your interview questions using voice or text input
                  </p>
                </CardHeader>
                <CardContent className="intro-content">
                  <p className="intro-note">
                    Click "Start Creating Interview" to begin the process.
                  </p>
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
                        <Button
                          onClick={stopSpeaking}
                          variant="outline"
                          size="lg"
                        >
                          <VolumeX className="btn-icon" />
                          Stop AI
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="text-input-section">
                    <Label htmlFor="text-input" className="text-input-label">
                      {speechSupported
                        ? "Or type your response:"
                        : "Type your response:"}
                    </Label>
                    <div className="text-input-group">
                      <Input
                        id="text-input"
                        placeholder={
                          step === "asking-count"
                            ? "Enter number (e.g., 5)"
                            : "Type your question here"
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              handleTextInput(value);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                        className="text-input-field"
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById("text-input");
                          const value = input && input.value.trim();
                          if (value) {
                            handleTextInput(value);
                            input.value = "";
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
                      <div className="confirmation-question">
                        "{pendingQuestion}"
                      </div>
                      <p className="confirmation-prompt">Is this correct?</p>
                      <div className="confirmation-actions">
                        <Button
                          onClick={handleSubmitQuestion}
                          variant="success"
                        >
                          Submit Question
                        </Button>
                        <Button onClick={handleRetryQuestion} variant="outline">
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="step-indicator">
                    {step === "asking-count" &&
                      "How many questions do you want? (1-20)"}
                    {step === "collecting-questions" &&
                      `Question ${
                        currentQuestionIndex + 1
                      } of ${totalQuestions}`}
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
                        onChange={(e) =>
                          setInterviewDetails((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Senior Developer Interview"
                        required
                      />
                    </div>

                    <div className="field-row">
                      <div className="field-group">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={interviewDetails.category}
                          onValueChange={(value) => {
                            setInterviewDetails((prev) => ({
                              ...prev,
                              category: value,
                              tags: [],
                            }));
                            setIsTagsOpen(false);
                          }}
                          placeholder="Select category"
                        >
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Accounting">Accounting</SelectItem>

                          <SelectItem value="AI Research">

                            AI Researcher
                          </SelectItem>
                          <SelectItem value="Aerospace Engineer">
                            Aerospace Engineer
                          </SelectItem>
                          <SelectItem value="Application Security Engineer">
                            Application Security Engineer
                          </SelectItem>
                          <SelectItem value="Back End">Back End</SelectItem>
                          <SelectItem value="Chemical Engineer">
                            Chemical Engineer
                          </SelectItem>
                          <SelectItem value="Civil Engineer">
                            Civil Engineer
                          </SelectItem>
                          <SelectItem value="Cloud Engineer">
                            Cloud Engineer
                          </SelectItem>
                          <SelectItem value="Cyber Security">
                            Cyber Security
                          </SelectItem>
                          <SelectItem value="Data Engineer">
                            Data Engineer
                          </SelectItem>
                          <SelectItem value="Data Scientist">
                            Data Scientist
                          </SelectItem>
                          <SelectItem value="Desktop Dev">
                            Desktop Dev
                          </SelectItem>
                          <SelectItem value="DevOps Engineer">
                            DevOps Engineer
                          </SelectItem>
                          <SelectItem value="Electrical Engineering">
                            Electrical Engineering
                          </SelectItem>
                          <SelectItem value="Electronics Engineer">
                            Electronics Engineer
                          </SelectItem>
                          <SelectItem value="Front End">Front End</SelectItem>
                          <SelectItem value="Full Stack">Full Stack</SelectItem>
                          <SelectItem value="Game Development">
                            Game Development
                          </SelectItem>
                          <SelectItem value="ML Engineer">
                            ML Engineer
                          </SelectItem>
                          <SelectItem value="Mechanical Engineering">
                            Mechanical Engineering
                          </SelectItem>
                          <SelectItem value="Mobile Dev">Mobile Dev</SelectItem>
                          <SelectItem value="Robotics Engineer">
                            Robotics Engineer
                          </SelectItem>
                          <SelectItem value="Security Engineer">
                            Security Engineer
                          </SelectItem>
                          <SelectItem value="Site Reliability Engineer">
                            Site Reliability Engineer
                          </SelectItem>
                        </Select>
                      </div>

                      <div className="field-group">
                        <Label htmlFor="difficulty">Difficulty Level *</Label>
                        <Select
                          value={interviewDetails.difficulty}
                          onValueChange={(value) =>
                            setInterviewDetails((prev) => ({
                              ...prev,
                              difficulty: value,
                            }))
                          }
                          placeholder="Select difficulty"
                        >
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </Select>
                      </div>
                    </div>

                    {/* Updated Tags Section with Category-Filtered Dropdown */}
                    {interviewDetails.category && (
                      <div className="field-group">
                        <Label htmlFor="tags">Tags</Label>

                        {/* Selected Tags Display */}
                        {interviewDetails.tags.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                              marginBottom: "12px",
                            }}
                          >
                            {interviewDetails.tags.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  padding: "6px 12px",
                                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                                  color: "#93c5fd",
                                  border: "1px solid rgba(59, 130, 246, 0.3)",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  style={{
                                    marginLeft: "8px",
                                    background: "none",
                                    border: "none",
                                    color: "#93c5fd",
                                    cursor: "pointer",
                                    padding: "0",
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "color 0.2s ease",
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Tags Dropdown */}
                        <div style={{ position: "relative" }}>
                          <button
                            type="button"
                            onClick={() => setIsTagsOpen(!isTagsOpen)}
                            className="input"
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              backgroundColor: "rgba(33, 36, 68, 0.6)",
                              border: "1px solid #d1d5db",
                              height: "2.5rem",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  interviewDetails.tags.length > 0
                                    ? "#fff"
                                    : "#9ca3af",
                                fontSize: "0.875rem",
                              }}
                            >
                              {interviewDetails.tags.length > 0
                                ? `${interviewDetails.tags.length} tag(s) selected`
                                : "Select tags"}
                            </span>
                            <ChevronDown
                              size={16}
                              style={{
                                color: "#9ca3af",
                                transform: isTagsOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                              }}
                            />
                          </button>

                          {isTagsOpen && (
                            <div 
         style={{
           position: 'absolute',
           top: '100%',
           left: '0',
           right: '0',
           backgroundColor: 'rgba(33, 36, 68, 0.9)',
           border: '1px solid #374151',
           borderRadius: '0.375rem',
           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
           maxHeight: '240px',
           overflowY: 'auto',
           zIndex: 1000,
           marginTop: '4px',
           padding: '4px 0'
         }}
       >
                              {availableTags.map((tag) => (
                                <label
             key={tag}
             style={{
               display: 'flex',
               alignItems: 'center',
               padding: '8px 12px',
               cursor: 'pointer',
               fontSize: '0.875rem',
               color: '#fff',
               transition: 'background-color 0.2s ease',
               userSelect: 'none'
             }}
             onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
             onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
           >
                                  <input
               type="checkbox"
               checked={interviewDetails.tags.includes(tag)}
               onChange={() => handleTagToggle(tag)}
               style={{
                 marginRight: '12px',
                 accentColor: '#3b82f6',
                 transform: 'scale(1.1)'
               }}
             />
                                  <span>{tag}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="field-group">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={interviewDetails.description}
                        onChange={(e) =>
                          setInterviewDetails((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief description of the interview..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="questions-summary">
                    <h4 className="summary-title">Questions Summary</h4>
                    <p className="summary-count">
                      Total Questions: {questions.length}
                    </p>
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
                    <Button
                      onClick={handleDetailsSubmit}
                      className="submit-btn"
                      variant="default"
                    >
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
                <p className="completion-description">
                  Your interview is ready to use
                </p>
              </CardHeader>
              <CardContent>
                <div className="completion-content">
                  <div className="result-summary">
                    <h3 className="result-title">{interviewDetails.title}</h3>
                    <div className="result-grid">
                      <div className="result-item">
                        <span className="result-label">Category:</span>{" "}
                        {interviewDetails.category}
                      </div>
                      <div className="result-item">
                        <span className="result-label">Difficulty:</span>{" "}
                        {interviewDetails.difficulty}
                      </div>
                      <div className="result-item">
                        <span className="result-label">Duration:</span>{" "}
                        {interviewDetails.duration
                          ? `${interviewDetails.duration} minutes`
                          : "Not specified"}
                      </div>
                      <div className="result-item">
                        <span className="result-label">Questions:</span>{" "}
                        {questions.length}
                      </div>
                      {interviewDetails.tags.length > 0 && (
                        <div className="result-item">
                          <span className="result-label">Tags:</span>{" "}
                          {interviewDetails.tags.join(", ")}
                        </div>
                      )}
                    </div>
                    {interviewDetails.description && (
                      <div className="result-description">
                        <span className="result-label">Description:</span>
                        <p className="description-text">
                          {interviewDetails.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="final-actions">
                    <Button
                      onClick={resetInterview}
                      variant="outline"
                      className="final-btn bg-transparent"
                    >
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
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, ChevronDown } from "lucide-react";
import './Voice.css'
// UI Components
const Button = ({ children, onClick, variant = "default", size = "default", className = "", type = "button", ...props }) => {
  const baseClass = "btn-base";
  const variantClass = `btn-${variant}`;
  const sizeClass = size === "lg" ? "btn-lg" : "btn-default-size";
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`card-title ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`input ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`label ${className}`}
  >
    {children}
  </label>
);

const WorkingSelect = ({ value, onValueChange, children, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  
  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);
  
  const options = React.Children.toArray(children).map(child => ({
    value: child.props.value,
    label: child.props.children
  }));
  
  const selectedOption = options.find(opt => opt.value === selectedValue);
  
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
        <span className={selectedOption ? "select-value" : "select-placeholder"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="select-content">
          {options.map(option => (
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
  return React.createElement('div', { value }, children);
};

const Textarea = ({ className = "", rows = 3, ...props }) => (
  <textarea
    className={`textarea ${className}`}
    rows={rows}
    {...props}
  />
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantClass = `badge-${variant}`;
  
  return (
    <div className={`badge ${variantClass} ${className}`}>
      {children}
    </div>
  );
};

// Toast hook simulation
const useToast = () => {
  return {
    toast: ({ title, description, variant }) => {
      alert(`${title}: ${description}`);
    }
  };
};

// Main Component
export default function InterviewCreator() {
  const [step, setStep] = useState("initial");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    title: "",
    category: "",
    difficulty: "",
    duration: "",
    description: "",
  });

  const recognitionRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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

  const speak = (text) => {
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

  const startListening = async () => {
    console.log("🔴 Start listening button clicked");

    if (!speechSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
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
        const count = numbers ? parseInt(numbers[0]) : 0;

        if (count > 0 && count <= 20) {
          setTotalQuestions(count);
          setStep("collecting-questions");
          setCurrentQuestionIndex(0);
          setTimeout(() => {
            speak(`Perfect! I'll collect ${count} questions. Please tell me your first question.`);
          }, 1000);
        } else {
          setTimeout(() => {
            speak("Please say a number between 1 and 20.");
          }, 500);
        }
        break;

      case "collecting-questions":
        const newQuestion = {
          id: Date.now(),
          text: cleanText,
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
            speak("Excellent! All questions collected. Please fill out the form below.");
          }, 1000);
        }
        break;
    }
  };

  const handleTextInput = (text) => {
    if (text.trim()) {
      setTranscript(text);
      handleVoiceInput(text);
    }
  };

  const startInterview = () => {
    setStep("asking-count");
    setTimeout(() => {
      speak("Hello! How many interview questions would you like to create? Please say a number between 1 and 20.");
    }, 500);
  };

  const handleDetailsSubmit = () => {
    if (!interviewDetails.title || !interviewDetails.category || !interviewDetails.difficulty) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setStep("completed");
    speak("Your interview pack has been created successfully!");
  };

  const resetInterview = () => {
    setStep("initial");
    setQuestions([]);
    setTotalQuestions(0);
    setCurrentQuestionIndex(0);
    setTranscript("");
    setInterviewDetails({
      title: "",
      category: "",
      difficulty: "",
      duration: "",
      description: "",
    });
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="container">
      <div className="max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Interview Pack</h1>
          <p className="text-lg text-gray-600">AI-powered interview question creator</p>

          {!speechSupported && (
            <div className="alert-warning mt-4">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Speech recognition not supported. Please use Chrome or Edge browser.
              </p>
            </div>
          )}
        </div>

        {step === "initial" && (
          <Card className="max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Start?</CardTitle>
              <p className="text-gray-600">Create your interview questions using voice or text input</p>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={startInterview} size="lg" className="btn-default">
                <Volume2 className="mr-2 h-5 w-5" />
                Start Creating Interview
              </Button>
            </CardContent>
          </Card>
        )}

        {(step === "asking-count" || step === "collecting-questions") && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  {speechSupported && (
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={startListening}
                        variant={isListening ? "destructive" : "default"}
                        size="lg"
                        className="min-w-48"
                      >
                        {isListening ? (
                          <>
                            <MicOff className="mr-2 h-5 w-5" />
                            Stop Listening
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2 h-5 w-5" />
                            Start Speaking
                          </>
                        )}
                      </Button>

                      {isSpeaking && (
                        <Button onClick={() => window.speechSynthesis && window.speechSynthesis.cancel()} variant="outline" size="lg">
                          <VolumeX className="mr-2 h-5 w-5" />
                          Stop AI
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="max-w-md">
                    <Label htmlFor="text-input" className="text-sm text-gray-600">
                      {speechSupported ? "Or type your response:" : "Type your response:"}
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="text-input"
                        placeholder={step === "asking-count" ? "Enter number (e.g., 5)" : "Type your question here"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              handleTextInput(value);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
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
                      >
                        Submit
                      </Button>
                    </div>
                  </div>

                  {transcript && (
                    <div className="transcript-display">
                      <p className="text-sm text-green-600 mb-1">You said:</p>
                      <p className="font-medium text-green-800">"{transcript}"</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    {step === "asking-count" && "How many questions do you want? (1-20)"}
                    {step === "collecting-questions" && `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
                  </div>

                  {isListening && (
                    <div className="pulse-indicator">
                      <div className="pulse-dot"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Questions Collected ({questions.length}/{totalQuestions})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div key={question.id} className="question-item">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <p className="flex-1">{question.text}</p>
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
              <p className="text-gray-600">Complete your interview pack</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Interview Title *</Label>
                    <Input
                      id="title"
                      value={interviewDetails.title}
                      onChange={(e) => setInterviewDetails((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Senior Developer Interview"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <WorkingSelect
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
                    </WorkingSelect>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level *</Label>
                    <WorkingSelect
                      value={interviewDetails.difficulty}
                      onValueChange={(value) => setInterviewDetails((prev) => ({ ...prev, difficulty: value }))}
                      placeholder="Select difficulty"
                    >
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </WorkingSelect>
                  </div>

                  <div>
                    <Label htmlFor="duration">Expected Duration</Label>
                    <WorkingSelect
                      value={interviewDetails.duration}
                      onValueChange={(value) => setInterviewDetails((prev) => ({ ...prev, duration: value }))}
                      placeholder="Select duration"
                    >
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </WorkingSelect>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={interviewDetails.description}
                    onChange={(e) => setInterviewDetails((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the interview..."
                    rows={3}
                  />
                </div>

                <div className="questions-summary">
                  <h4 className="font-medium mb-2">Questions Summary</h4>
                  <p className="text-sm text-gray-600 mb-2">Total Questions: {questions.length}</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {questions.map((question, index) => (
                      <div key={question.id} className="text-sm">
                        <span className="font-medium">{index + 1}.</span> {question.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleDetailsSubmit} 
                    className="flex-1"
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
          <Card className="max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600">Interview Pack Created! 🎉</CardTitle>
              <p className="text-gray-600">Your interview is ready to use</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="interview-result">
                <h3 className="font-bold text-lg mb-4">{interviewDetails.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span> {interviewDetails.category}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {interviewDetails.difficulty}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    {interviewDetails.duration ? `${interviewDetails.duration} minutes` : "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Questions:</span> {questions.length}
                  </div>
                </div>
                {interviewDetails.description && (
                  <div className="mt-4">
                    <span className="font-medium">Description:</span>
                    <p className="text-gray-700 mt-1">{interviewDetails.description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button onClick={resetInterview} className="flex-1" variant="outline">
                  Create Another Interview
                </Button>
                <Button className="flex-1" variant="default">View Interview Pack</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
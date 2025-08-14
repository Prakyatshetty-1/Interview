// src/pages/InterviewPortal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, VolumeX, Loader2, Play } from "lucide-react";

export default function InterviewPortal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]); // array of strings for UI
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

  // stable refs to avoid state/closure races
  const currentQuestionIndexRef = useRef(0);
  const inFlightRef = useRef(false);
  const interviewQuestionsRef = useRef([]); // <-- latest questions for callbacks

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const initRecognition = () => {
    try {
      if (!(typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition))) {
        recognitionRef.current = null;
        return;
      }

      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognitionConstructor();

      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        // when engine reports start, ensure UI is consistent
        setIsListening(true);
      };

      rec.onresult = (event) => {
        try {
          // Stop right away to avoid receiving additional results or duplicates
          try { rec.stop(); } catch (e) { /* ignore */ }
          setIsListening(false);

          const speechResult = (event.results?.[0]?.[0]?.transcript || "").trim();
          console.log("[recognition] result:", speechResult);

          if (!speechResult) {
            setError("No speech detected. Please try again.");
            return;
          }

          if (inFlightRef.current) {
            console.warn("[recognition] onresult but a request is already in flight — ignoring extra result.");
            return;
          }

          setUserAnswerText(speechResult);
          setTranscript((prev) => [...prev, { type: "answer", text: speechResult }]);

          // fetch the current question from the stable ref
          const qIndex = typeof currentQuestionIndexRef.current === "number" ? currentQuestionIndexRef.current : currentQuestionIndex;
          const question = Array.isArray(interviewQuestionsRef.current) ? interviewQuestionsRef.current[qIndex] : undefined;

          processUserAnswer(speechResult, question, qIndex);
        } catch (e) {
          console.error("[recognition] onresult error:", e);
        }
      };

      rec.onerror = (event) => {
        console.error("[recognition] onerror:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          setError("No speech detected. Please try again.");
        } else {
          // attempt gentle reinit
          setTimeout(() => {
            try {
              initRecognition();
            } catch (e) {
              console.error("Failed to reinit recognition:", e);
            }
          }, 400);
        }
      };

      rec.onend = () => {
        // normal end; keep UI consistent
        setIsListening(false);
      };

      recognitionRef.current = rec;
      console.log("Speech recognition initialized.");
    } catch (err) {
      console.error("initRecognition error:", err);
      recognitionRef.current = null;
    }
  };

  // fetch pack & map questions robustly
  useEffect(() => {
    const fetchPack = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/api/interviews/${id}`, { headers });

        const text = await res.text().catch(() => "");
        if (!res.ok) {
          if (res.status === 401) {
            setError("Unauthorized. Please log in to access this interview pack.");
            console.error("Fetch pack unauthorized:", text);
            return;
          }
          throw new Error(`${res.status} ${text}`);
        }

        let pack;
        try {
          pack = text ? JSON.parse(text) : {};
        } catch (e) {
          console.warn("Could not parse pack JSON:", text);
          setError("Server returned non-JSON response for pack.");
          return;
        }

        let questions = [];
        if (Array.isArray(pack.questions)) {
          if (pack.questions.length > 0) {
            if (typeof pack.questions[0] === "string") {
              questions = pack.questions;
            } else if (typeof pack.questions[0] === "object") {
              questions = pack.questions.map((q) => q.question || q.text || q.prompt || "").filter(Boolean);
            }
          }
        } else if (Array.isArray(pack.items)) {
          questions = pack.items.map((i) => (typeof i === "string" ? i : i.question || i.text || "")).filter(Boolean);
        }

        if (!questions || questions.length === 0) {
          console.warn("Pack loaded but no questions found. Pack:", pack);
          setError("This pack doesn't contain any questions.");
          setInterviewQuestions([]);
          interviewQuestionsRef.current = [];
        } else {
          setInterviewQuestions(questions);
          interviewQuestionsRef.current = questions; // keep the ref up-to-date
          setError("");
        }
      } catch (err) {
        console.error("Error fetching interview pack:", err);
        setError("Failed to fetch interview pack. See console for details.");
      }
    };

    fetchPack();
  }, [id]);

  // init speech APIs once on mount
  useEffect(() => {
    initRecognition();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    if (typeof window !== "undefined") {
      if (!(window.SpeechRecognition || window.webkitSpeechRecognition) && !("speechSynthesis" in window)) {
        setError("Neither Speech Recognition nor Speech Synthesis is supported. Use Chrome for best experience.");
      } else if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
        setError("Speech Recognition is not supported. Use Chrome for best experience.");
      } else if (!("speechSynthesis" in window)) {
        setError("Speech Synthesis is not supported. Voice feedback will not be available.");
      }
    }

    return () => {
      try { recognitionRef.current && recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
      try { synthRef.current && synthRef.current.cancel(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // speak text & return when finished
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }
      setIsSpeaking(true);
      try { synthRef.current.cancel(); } catch (e) { /* ignore */ }
      const utter = new window.SpeechSynthesisUtterance(String(text));
      utter.lang = "en-US";
      utter.rate = 0.95;
      utter.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utter.onerror = (err) => {
        console.error("SpeechSynthesis error", err);
        setIsSpeaking(false);
        resolve();
      };
      synthRef.current.speak(utter);
    });
  };

  // robust call to backend AI proxy (retries & timeouts)
  const callAIFeedback = async (question, answer, maxRetries = 2) => {
    const url = `${API_BASE}/api/ai/feedback`;
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ question, answer }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const text = await res.text().catch(() => "");
        if (!res.ok) {
          console.warn(`[callAIFeedback] attempt ${attempt} failed: ${res.status} ${text}`);
          if (attempt < maxRetries) {
            await wait(500 * (attempt + 1));
            continue;
          } else {
            // try to return fallback message if present in body
            try {
              const parsed = text ? JSON.parse(text) : {};
              return parsed.feedback || parsed.error || `AI service returned ${res.status}`;
            } catch {
              return `AI service returned ${res.status}: ${text || "No body"}`;
            }
          }
        }

        let json;
        try {
          json = text ? JSON.parse(text) : {};
        } catch (e) {
          console.warn("[callAIFeedback] could not parse JSON response:", text);
          if (attempt < maxRetries) {
            await wait(500 * (attempt + 1));
            continue;
          } else {
            return "No feedback available (invalid AI response)";
          }
        }

        const fallback = json.feedback || json.result || json.message || (json.data && json.data.feedback) || null;
        if (!fallback) return "No feedback available";
        return fallback;
      } catch (err) {
        if (err.name === "AbortError") {
          console.warn(`[callAIFeedback] attempt ${attempt} aborted (timeout)`);
        } else {
          console.error(`[callAIFeedback] attempt ${attempt} error:`, err);
        }
        if (attempt < maxRetries) {
          await wait(500 * (attempt + 1));
          continue;
        }
        return "No feedback available (network error)";
      }
    }
  };

  // ask question: put in transcript, speak it, then start listening
  const askQuestion = async (index) => {
    if (!interviewQuestionsRef.current || index >= interviewQuestionsRef.current.length) {
      const completionMessage = "Interview completed! Thank you for your time.";
      setTranscript((prev) => [...prev, { type: "feedback", text: completionMessage }]);
      await speakText(completionMessage);
      setInterviewStarted(false);
      return;
    }

    currentQuestionIndexRef.current = index;
    setCurrentQuestionIndex(index);

    const question = interviewQuestionsRef.current[index];
    setTranscript((prev) => [...prev, { type: "question", text: question }]);

    await speakText(question);

    // ensure recognizer present
    if (!recognitionRef.current) {
      initRecognition();
    }

    // slight delay to let speechSynthesis finish internal steps
    setTimeout(() => startListening(), 120);
  };

  const startInterview = () => {
    if (!interviewQuestionsRef.current || interviewQuestionsRef.current.length === 0) {
      setError("No questions available for this pack.");
      return;
    }
    setInterviewStarted(true);
    currentQuestionIndexRef.current = 0;
    setCurrentQuestionIndex(0);
    setTranscript([]);
    setFeedback("");
    setUserAnswerText("");
    inFlightRef.current = false;
    askQuestion(0);
  };

  // resilient startListening that handles InvalidStateError by reinit/retry
  const startListening = async () => {
    if (!recognitionRef.current) {
      setError("Speech Recognition is not available in your browser.");
      return;
    }
    if (isListening) return;

    const tryStart = async (attempt = 0) => {
      try {
        // cancel any TTS to avoid capturing it
        if (synthRef.current) try { synthRef.current.cancel(); } catch (e) {}
        recognitionRef.current.start();
        // note: onstart handler sets isListening = true
        setUserAnswerText("Listening...");
        setError("");
        console.log("Started recognition for question index:", currentQuestionIndexRef.current);
      } catch (e) {
        console.warn("Error starting recognition:", e);
        // often InvalidStateError occurs when engine is already starting; retry a couple times
        const msg = (e && e.name) ? e.name : (e && e.message) ? e.message : String(e);
        if (attempt < 3 && /invalidstateerror|started|already started/i.test(msg)) {
          // try stopping or aborting, re-init recognition and retry after short delay
          try { recognitionRef.current.stop(); } catch (s) {}
          try { recognitionRef.current.abort?.(); } catch (s) {}
          setTimeout(() => {
            tryStart(attempt + 1);
          }, 200 + attempt * 150);
        } else {
          setIsListening(false);
          setError("Failed to start microphone. Check permissions and try again.");
          // final fallback: re-init recognition completely
          setTimeout(initRecognition, 400);
        }
      }
    };

    tryStart();
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognizer:", e);
      }
      setIsListening(false);
    }
  };

  // process user answer -> call backend -> speak feedback -> advance
  const processUserAnswer = async (answer, passedQuestion = null, passedIndex = null) => {
    if (inFlightRef.current) {
      console.warn("processUserAnswer called while inFlight -> ignoring duplicate.");
      return;
    }
    inFlightRef.current = true;

    try {
      let question = passedQuestion;
      let qIndex = passedIndex;
      if (!question) {
        qIndex = (typeof currentQuestionIndexRef.current === "number") ? currentQuestionIndexRef.current : qIndex;
        question = interviewQuestionsRef.current?.[qIndex];
      }

      if (!answer || answer.trim().length === 0) {
        const errMsg = "No answer detected. Moving to next question.";
        setFeedback(errMsg);
        setTranscript((prev) => [...prev, { type: "feedback", text: errMsg }]);
        await speakText(errMsg);
        setCurrentQuestionIndex((prev) => {
          const next = prev + 1;
          currentQuestionIndexRef.current = next;
          askQuestion(next);
          return next;
        });
        return;
      }

      if (!question) {
        console.warn("[processUserAnswer] no question available for index:", qIndex);
        const errMsg = "Internal error: question missing. Moving to next question.";
        setFeedback(errMsg);
        setTranscript((prev) => [...prev, { type: "feedback", text: errMsg }]);
        await speakText(errMsg);
        setCurrentQuestionIndex((prev) => {
          const next = prev + 1;
          currentQuestionIndexRef.current = next;
          askQuestion(next);
          return next;
        });
        return;
      }

      setIsLoadingLLM(true);
      setFeedback("");
      setError("");

      console.log("[processUserAnswer] calling AI with:", { question, answer });
      const aiFeedback = await callAIFeedback(question, answer);
      console.log("[processUserAnswer] aiFeedback:", aiFeedback);

      const safeFeedback = aiFeedback || "No feedback available";
      setFeedback(safeFeedback);
      setTranscript((prev) => [...prev, { type: "feedback", text: safeFeedback }]);

      await speakText(safeFeedback);

      setCurrentQuestionIndex((prev) => {
        const next = prev + 1;
        currentQuestionIndexRef.current = next;
        askQuestion(next);
        return next;
      });
    } catch (err) {
      console.error("Error processing answer:", err);
      const errMsg = "There was an error processing your answer. Moving to next question.";
      setFeedback(errMsg);
      setTranscript((prev) => [...prev, { type: "feedback", text: errMsg }]);
      await speakText(errMsg);

      setCurrentQuestionIndex((prev) => {
        const next = prev + 1;
        currentQuestionIndexRef.current = next;
        askQuestion(next);
        return next;
      });
    } finally {
      setIsLoadingLLM(false);
      inFlightRef.current = false;
    }
  };

  // UI (kept similar to your original)
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "stretch" }}>
      <div style={{ width: "50%", position: "relative", background: "rgba(15,16,31,0.6)" }}>
        <iframe
          src="https://my.spline.design/voiceinteractionanimation-2TyeWSP24w6QzdGddVpF30we/"
          frameBorder="0"
          title="Askora Voice Interaction Animation"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>

      <div style={{ width: "50%", padding: 24, overflowY: "auto", background: "rgba(33,36,68,0.6)" }}>
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            {error}
            {error.toLowerCase().includes("unauthor") && (
              <div style={{ marginTop: 8 }}>
                <button onClick={() => navigate("/login")} style={{ padding: "8px 12px", borderRadius: 6, background: "#4f46e5", color: "#fff", border: "none" }}>
                  Go to Login
                </button>
              </div>
            )}
          </div>
        )}

        {!interviewStarted ? (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ color: "#fff" }}>Askora Interview Portal</h1>
            <p style={{ color: "#9ca3af" }}>
              This interview will ask the questions in the selected pack and provide AI feedback.
            </p>
            <button
              onClick={startInterview}
              disabled={interviewQuestionsRef.current.length === 0}
              style={{
                padding: "12px 20px",
                borderRadius: 8,
                background: interviewQuestionsRef.current.length === 0 ? "#9ca3af" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color: "#fff",
                border: "none"
              }}
            >
              <Play style={{ marginRight: 8 }} />
              {interviewQuestionsRef.current.length === 0 ? "Loading..." : "Start Interview"}
            </button>
          </div>
        ) : (
          <>
            <div style={{ background: "rgba(15,16,31,0.6)", padding: 16, borderRadius: 12 }}>
              <h2 style={{ color: "#94a3b8" }}>
                {currentQuestionIndex < interviewQuestionsRef.current.length ? `Question ${currentQuestionIndex + 1}/${interviewQuestionsRef.current.length}:` : "Interview Completed!"}
              </h2>

              {currentQuestionIndex < interviewQuestionsRef.current.length && (
                <p style={{ color: "#e6edf3" }}>{interviewQuestionsRef.current[currentQuestionIndex]}</p>
              )}

              {feedback && (
                <div style={{ marginTop: 12 }}>
                  <strong>Feedback:</strong>
                  <p>{feedback}</p>
                </div>
              )}

              {userAnswerText && userAnswerText !== "Listening..." && (
                <div>
                  <strong>Your Answer:</strong>
                  <p>{userAnswerText}</p>
                </div>
              )}

              {userAnswerText === "Listening..." && <div style={{ color: "#3b82f6" }}>Listening for your response...</div>}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking || isLoadingLLM || currentQuestionIndex >= interviewQuestionsRef.current.length || !recognitionRef.current}
                style={{ padding: "10px 16px", borderRadius: 8, background: isListening ? "#ef4444" : "#4f46e5", color: "#fff", border: "none" }}
              >
                {isListening ? <><MicOff /> Stop Listening</> : <><Mic /> Start Listening</>}
              </button>

              <button onClick={() => synthRef.current?.cancel()} disabled={!isSpeaking} style={{ padding: "10px 16px", borderRadius: 8 }}>
                <VolumeX /> Stop Speaking
              </button>
            </div>

            {isLoadingLLM && <div style={{ textAlign: "center", marginTop: 12 }}><Loader2 /> Processing your answer...</div>}

            <div style={{ marginTop: 18 }}>
              <h3 style={{ color: "#94a3b8" }}>Transcript</h3>
              <div style={{ background: "rgba(15,16,31,0.73)", padding: 12, borderRadius: 8, minHeight: 160 }}>
                {transcript.length === 0 ? (
                  <p style={{ color: "#9ca3af" }}>No transcript yet.</p>
                ) : (
                  transcript.map((entry, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <strong>{entry.type === "question" ? "Interviewer" : entry.type === "answer" ? "You" : "Feedback"}:</strong>{" "}
                      <span>{entry.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

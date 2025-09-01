// src/pages/InterviewPortal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, VolumeX, Loader2, Play } from "lucide-react";

export default function InterviewPortal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userAnswerText, setUserAnswerText] = useState("");
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [packMeta, setPackMeta] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const currentQuestionIndexRef = useRef(0);
  const inFlightRef = useRef(false);
  const interviewQuestionsRef = useRef([]);
  const isSpeakingRef = useRef(false);

  // near top of InterviewPortal component
  const interviewQuestionIdsRef = useRef([]); // stores question ids (if available)


  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // Add function to update LeetCode stats
// InterviewPortal.jsx — replace existing updateLeetCodeStats implementation with this
const updateLeetCodeStats = async (payload = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[updateLeetCodeStats] no token, skipping');
      return null;
    }

    // Build body: prefer interviewId + questionIds, fallback to difficulty/count
    const body = {};
    if (payload && typeof payload === 'object') {
      if (payload.interviewId) body.interviewId = payload.interviewId;
      if (Array.isArray(payload.questionIds) && payload.questionIds.length) body.questionIds = payload.questionIds;
      if (!body.interviewId && payload.difficulty) {
        body.difficulty = String(payload.difficulty).toLowerCase();
        body.questionsCompleted = Number(payload.questionsCompleted || 1);
      }
    }

    if (!body.interviewId && (!Array.isArray(body.questionIds) || body.questionIds.length === 0) && !body.difficulty) {
      console.warn('[updateLeetCodeStats] nothing to send (no interviewId, no questionIds, no difficulty)');
      return null;
    }

    console.log('[updateLeetCodeStats] sending body:', body);
    const res = await fetch(`${API_BASE}/api/leetcode/update-after-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    // robust parse
    let data = {};
    try {
      const txt = await res.text();
      data = txt ? JSON.parse(txt) : {};
    } catch (err) {
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }
    }

    if (!res.ok) {
      console.warn('[updateLeetCodeStats] server returned error', res.status, data);
      return data;
    }

    const leetcodeStats = data?.leetcodeStats ?? null;
    console.log('[updateLeetCodeStats] server response leetcodeStats:', leetcodeStats, 'newlySolvedCount:', data?.newlySolvedCount);

    // same-tab event (fast)
    try {
      window.dispatchEvent(new CustomEvent('leetcodeStatsUpdated', { detail: { leetcodeStats } }));
    } catch (e) {
      console.warn('dispatchEvent failed', e);
    }

    // cross-tab: set a storage key so other tabs' storage listeners fire
    try {
      localStorage.setItem('leetcodeStatsLastUpdated', String(Date.now()));
    } catch (e) {
      /* ignore */
    }

    return data;
  } catch (err) {
    console.error('[updateLeetCodeStats] error', err);
    return null;
  }
};


  // Function to determine difficulty from pack metadata
  const getDifficultyFromPack = () => {
    if (!packMeta) return null;
    
    // Check various fields where difficulty might be stored
    const difficulty = packMeta.level || 
                     packMeta.difficulty || 
                     packMeta.levelName || 
                     (packMeta.meta && (packMeta.meta.level || packMeta.meta.difficulty));
    
    if (!difficulty) return null;
    
    const difficultyStr = String(difficulty).toLowerCase();
    
    // Map common difficulty terms to standard values
    if (difficultyStr.includes('easy') || difficultyStr.includes('beginner')) {
      return 'easy';
    } else if (difficultyStr.includes('medium') || difficultyStr.includes('intermediate')) {
      return 'medium';
    } else if (difficultyStr.includes('hard') || difficultyStr.includes('advanced') || difficultyStr.includes('expert')) {
      return 'hard';
    }
    
    return null;
  };

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
        setIsListening(true);
      };

      rec.onresult = (event) => {
        try {
          try { rec.stop(); } catch (e) { /* ignore */ }
          setIsListening(false);

          const speechResult = (event.results?.[0]?.[0]?.transcript || "").trim();
          console.log("[recognition] result:", speechResult);

          if (!speechResult) {
            setError("No speech detected. Please try again.");
            return;
          }

          if (inFlightRef.current) {
            console.warn("[recognition] onresult but a request is already in flight – ignoring extra result.");
            return;
          }

          setUserAnswerText(speechResult);
          setTranscript((prev) => [...prev, { type: "answer", text: speechResult }]);

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
        setIsListening(false);
      };

      recognitionRef.current = rec;
      console.log("Speech recognition initialized.");
    } catch (err) {
      console.error("initRecognition error:", err);
      recognitionRef.current = null;
    }
  };

  // helper: try to pull user id from a JWT in localStorage
  const getUserIdFromToken = (token) => {
    if (!token || typeof token !== "string") return null;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(decodeURIComponent(escape(atob(payload))));
      return json.sub || json.userId || json.id || json._id || null;
    } catch (e) {
      return null;
    }
  };

  // Modified saveRecentInterview function to also update LeetCode stats
  const saveRecentInterview = async () => {
    try {
      const summaryTitle = (packMeta && packMeta.title)
        ? String(packMeta.title).slice(0, 120)
        : (Array.isArray(interviewQuestionsRef.current) && interviewQuestionsRef.current[0])
          ? String(interviewQuestionsRef.current[0]).slice(0, 120)
          : `Interview ${id || ""}`;

      const summary = {
        interviewId: id || null,
        packId: (packMeta && packMeta.id) || id || null,
        id: (packMeta && packMeta.id) || id || null,
        title: summaryTitle,
        questionsCount: Array.isArray(interviewQuestionsRef.current)
          ? interviewQuestionsRef.current.length
          : (interviewQuestions.length || 0),
        attemptedAt: new Date().toISOString(),
        transcript: transcript.slice(-30).map((t) => ({
          type: t.type,
          text: String(t.text).slice(0, 600),
        })),
        creator: (packMeta && packMeta.creator) || null,
        level: (packMeta && packMeta.level) || null,
        company: (packMeta && packMeta.company) || null,
        duration: (packMeta && packMeta.duration) || null,
      };

      const token = localStorage.getItem('token');
      const userId = getUserIdFromToken(token);
      if (userId) summary.userId = userId;

      // Update LeetCode stats based on difficulty and number of questions
// inside saveRecentInterview()
const payload = {
  interviewId: id, // pack id from useParams
  // prefer real question ids if you extracted them during pack fetch:
  questionIds: Array.isArray(interviewQuestionIdsRef.current) && interviewQuestionIdsRef.current.length
    ? interviewQuestionIdsRef.current
    : undefined,
  // keep fallback for backward compatibility:
  difficulty: getDifficultyFromPack() || undefined,
  questionsCompleted: summary.questionsCount || 1
};

try {
  await updateLeetCodeStats(payload);
} catch (err) {
  console.warn('[InterviewPortal] updateLeetCodeStats failed', err);
}

      // Save recent interview to server
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/profile/recent-interviews`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(summary),
          });

          if (res.ok) {
            console.log('[InterviewPortal] recent interview saved to server');
            return;
          } else {
            const txt = await res.text().catch(() => '');
            console.warn('[InterviewPortal] server save failed:', res.status, txt);
          }
        } catch (err) {
          console.warn('[InterviewPortal] server save error - falling back to localStorage', err);
        }
      }

      // Fallback: localStorage namespaced by user id
      try {
        const token = localStorage.getItem("token");
        const userId = getUserIdFromToken(token);
        const baseKey = `recentInterviews_${userId || "anonymous"}`;
        const raw = localStorage.getItem(baseKey);
        const arr = raw ? JSON.parse(raw) : [];

        const deduped = (arr || []).filter((item) => {
          if (item.packId && summary.packId) return item.packId !== summary.packId;
          if (item.interviewId && summary.interviewId) return item.interviewId !== summary.interviewId;
          return !(
            item.title === summary.title &&
            Number(item.questionsCount) === Number(summary.questionsCount)
          );
        });

        deduped.unshift(summary);
        const sliced = deduped.slice(0, 20);
        localStorage.setItem(baseKey, JSON.stringify(sliced));
        console.log(`[InterviewPortal] recent interview saved to localStorage key=${baseKey}`);
      } catch (err) {
        console.error("[InterviewPortal] failed to save recent interview to localStorage", err);
      }
    } catch (err) {
      console.error('[InterviewPortal] saveRecentInterview error', err);
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

// inside fetchPack, replace current question extraction with this block
let questions = [];
let questionIds = [];

if (Array.isArray(pack.questions) && pack.questions.length > 0) {
  // pack.questions may be strings or objects
  for (const q of pack.questions) {
    if (typeof q === "string") {
      questions.push(q);
      questionIds.push(""); // unknown id
    } else if (typeof q === "object") {
      const text = q.question || q.text || q.prompt || q.title || "";
      const qid = String(q._id ?? q.id ?? q.questionId ?? q.slug ?? "").trim();
      questions.push(text || qid || "");
      questionIds.push(qid || "");
    }
  }
} else if (Array.isArray(pack.items)) {
  for (const it of pack.items) {
    if (typeof it === "string") {
      questions.push(it);
      questionIds.push("");
    } else {
      const text = it.question || it.text || "";
      const qid = String(it._id ?? it.id ?? it.questionId ?? "").trim();
      questions.push(text || qid || "");
      questionIds.push(qid || "");
    }
  }
}

// set UI-friendly array of question texts:
setInterviewQuestions(questions);
interviewQuestionsRef.current = questions;

// set ids separately for server updates:
interviewQuestionIdsRef.current = questionIds.filter(Boolean); // keep only truthy ids


        if (!questions || questions.length === 0) {
          console.warn("Pack loaded but no questions found. Pack:", pack);
          setError("This pack doesn't contain any questions.");
          setInterviewQuestions([]);
          interviewQuestionsRef.current = [];
        } else {
          // Enhanced pack metadata extraction
          setPackMeta(
            pack && typeof pack === "object"
              ? {
                  id: pack.id || pack._id || id,
                  title: pack.title || pack.name || pack.packName || null,
                  creator:
                    pack.creator ||
                    pack.author ||
                    pack.createdBy ||
                    pack.owner ||
                    pack.uploader ||
                    (pack.meta && (pack.meta.creator || pack.meta.author)) ||
                    null,
                  // Enhanced level/difficulty detection
                  level:
                    pack.level ||
                    pack.difficulty ||
                    pack.levelName ||
                    pack.difficultyLevel ||
                    (pack.meta && (pack.meta.level || pack.meta.difficulty || pack.meta.levelName)) ||
                    // Check tags for difficulty keywords
                    (pack.tags && Array.isArray(pack.tags) && 
                     pack.tags.find(tag => 
                       typeof tag === 'string' && 
                       /^(easy|medium|hard|beginner|intermediate|advanced|expert)$/i.test(tag.trim())
                     )) ||
                    // Check category for difficulty keywords
                    (pack.category && typeof pack.category === 'string' &&
                     /easy|medium|hard|beginner|intermediate|advanced|expert/i.test(pack.category) &&
                     pack.category.match(/easy|medium|hard|beginner|intermediate|advanced|expert/i)?.[0]) ||
                    null,
                  company: pack.company || pack.source || pack.provider || null,
                  duration:
                    pack.duration || pack.estimatedDuration || pack.length || null,
                }
              : null
          );

          setInterviewQuestions(questions);
          interviewQuestionsRef.current = questions;
          setError("");
          
          // Log pack metadata for debugging
          console.log('Pack metadata loaded:', {
            title: pack.title || pack.name,
            level: pack.level || pack.difficulty,
            tags: pack.tags,
            category: pack.category
          });
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
      if (recognitionRef.current) {
        try { 
          recognitionRef.current.stop(); 
          recognitionRef.current.abort?.();
        } catch (e) {}
        recognitionRef.current = null;
      }
      
      if (synthRef.current) {
        try { 
          synthRef.current.cancel(); 
        } catch (e) {}
      }
      
      isSpeakingRef.current = false;
      inFlightRef.current = false;
    };
  }, []);

  // speak text & return when finished - IMPROVED VERSION
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }

      const startSpeech = () => {
        if (isSpeakingRef.current) {
          setTimeout(startSpeech, 100);
          return;
        }

        setIsSpeaking(true);
        isSpeakingRef.current = true;

        try {
          synthRef.current.cancel();
          setTimeout(() => {
            const utter = new window.SpeechSynthesisUtterance(String(text));
            utter.lang = "en-US";
            utter.rate = 0.95;
            
            utter.onstart = () => {
              console.log("Speech started:", text.substring(0, 50));
            };
            
            utter.onend = () => {
              console.log("Speech ended");
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              resolve();
            };
            
            utter.onerror = (err) => {
              console.error("SpeechSynthesis error", err);
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              resolve();
            };
            
            try {
              synthRef.current.speak(utter);
            } catch (e) {
              console.error("Error calling speak:", e);
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              resolve();
            }
          }, 50);
        } catch (e) {
          console.error("Error canceling speech:", e);
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          resolve();
        }
      };

      startSpeech();
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
      setShowCompletionModal(true);
      return;
    }

    currentQuestionIndexRef.current = index;
    setCurrentQuestionIndex(index);

    const question = interviewQuestionsRef.current[index];
    setTranscript((prev) => [...prev, { type: "question", text: question }]);

    if (isListening) {
      stopListening();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await speakText(question);

    if (!recognitionRef.current) {
      initRecognition();
    }

    setTimeout(() => startListening(), 300);
  };

  const startInterview = () => {
    if (!interviewQuestionsRef.current || interviewQuestionsRef.current.length === 0) {
      setError("No questions available for this pack.");
      return;
    }
    setInterviewStarted(true);
    currentQuestionIndexRef.current = 0;
    setShowCompletionModal(false);

    setCurrentQuestionIndex(0);
    setTranscript([]);
    setFeedback("");
    setUserAnswerText("");

    inFlightRef.current = false;
    askQuestion(0);
  };

  // Helper function for actually starting recognition
  const actuallyStartListening = async () => {
    const tryStart = async (attempt = 0) => {
      try {
        if (synthRef.current) {
          try { 
            synthRef.current.cancel(); 
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (e) {
            console.warn("Error canceling TTS:", e);
          }
        }

        recognitionRef.current.start();
        setUserAnswerText("Listening...");
        setError("");
        console.log("Started recognition for question index:", currentQuestionIndexRef.current);
      } catch (e) {
        console.warn("Error starting recognition:", e);
        const msg = (e && e.name) ? e.name : (e && e.message) ? e.message : String(e);
        
        if (attempt < 3 && /invalidstateerror|started|already started/i.test(msg)) {
          try { 
            recognitionRef.current.stop(); 
            recognitionRef.current.abort?.();
          } catch (s) {}
          
          setTimeout(() => {
            initRecognition();
            tryStart(attempt + 1);
          }, 300 + attempt * 200);
        } else {
          setIsListening(false);
          setError("Failed to start microphone. Check permissions and try again.");
          setTimeout(initRecognition, 400);
        }
      }
    };

    tryStart();
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      setError("Speech Recognition is not available in your browser.");
      return;
    }
    if (isListening) return;

    if (isSpeakingRef.current) {
      console.log("Waiting for speech to finish before starting recognition...");
      const waitForSpeech = () => {
        if (isSpeakingRef.current) {
          setTimeout(waitForSpeech, 100);
        } else {
          setTimeout(() => actuallyStartListening(), 200);
        }
      };
      waitForSpeech();
      return;
    }

    actuallyStartListening();
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
        
        const next = currentQuestionIndexRef.current + 1;
        currentQuestionIndexRef.current = next;
        setCurrentQuestionIndex(next);
        askQuestion(next);
        return;
      }

      if (!question) {
        console.warn("[processUserAnswer] no question available for index:", qIndex);
        const errMsg = "Internal error: question missing. Moving to next question.";
        setFeedback(errMsg);
        setTranscript((prev) => [...prev, { type: "feedback", text: errMsg }]);
        await speakText(errMsg);
        
        const next = currentQuestionIndexRef.current + 1;
        currentQuestionIndexRef.current = next;
        setCurrentQuestionIndex(next);
        askQuestion(next);
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

      const next = currentQuestionIndexRef.current + 1;
      currentQuestionIndexRef.current = next;
      setCurrentQuestionIndex(next);
      askQuestion(next);
    } catch (err) {
      console.error("Error processing answer:", err);
      const errMsg = "There was an error processing your answer. Moving to next question.";
      setFeedback(errMsg);
      setTranscript((prev) => [...prev, { type: "feedback", text: errMsg }]);
      await speakText(errMsg);

      const next = currentQuestionIndexRef.current + 1;
      currentQuestionIndexRef.current = next;
      setCurrentQuestionIndex(next);
      askQuestion(next);
    } finally {
      setIsLoadingLLM(false);
      inFlightRef.current = false;
    }
  };

  // UI (kept similar to your original)
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
                Click "Start Interview" to begin. Askora will ask you questions, 
                provide feedback, and track your progress in your LeetCode stats.
              </p>
              {packMeta && (
                <div className="askora-pack-info">
                  <h3>{packMeta.title}</h3>
                  {packMeta.level && (
                    <span className={`difficulty-badge difficulty-${getDifficultyFromPack() || 'unknown'}`}>
                      {packMeta.level}
                    </span>
                  )}
                  {packMeta.creator && <p>Created by: {packMeta.creator}</p>}
                  {packMeta.company && <p>Company: {packMeta.company}</p>}
                </div>
              )}
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

        {/* Completion Modal */}
        {showCompletionModal && (
          <div className="askora-modal-overlay">
            <div className="askora-modal">
              <div className="askora-modal-content">
                <div className="askora-modal-icon">
                  <div className="success-checkmark">
                    <div className="check-icon">
                      <span className="icon-line line-tip"></span>
                      <span className="icon-line line-long"></span>
                    </div>
                  </div>
                </div>
                <h2 className="askora-modal-title">Interview Completed!</h2>
                <p className="askora-modal-message">
                  Thank you for completing the interview. Your responses have been recorded 
                  {getDifficultyFromPack() && ` and your ${getDifficultyFromPack()} difficulty stats have been updated`}.
                </p>
                {getDifficultyFromPack() && (
                  <div className="askora-stats-update">
                    <span className={`difficulty-badge difficulty-${getDifficultyFromPack()}`}>
                      +{1} {getDifficultyFromPack().toUpperCase()} Question{interviewQuestions.length > 1 ? '1' : ''}
                    </span>
                  </div>
                )}
                <div className="askora-modal-actions">
                  <button
                    onClick={async () => {
                      try {
                        await saveRecentInterview();
                      } catch (e) {
                        console.warn("Failed saving recent interview (non-fatal):", e);
                      } finally {
                        navigate('/dashboard');
                      }
                    }}
                    className="askora-btn askora-btn-primary askora-btn-large"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

        /* Modal Styles */
        .askora-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .askora-modal {
          background: rgba(33, 36, 68, 0.95);
          border-radius: 20px;
          border: 1px solid rgba(79, 70, 229, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideInUp 0.4s ease-out;
          backdrop-filter: blur(10px);
        }

        .askora-modal-content {
          padding: 3rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .askora-modal-icon {
          width: 80px;
          height: 80px;
          margin-bottom: 1rem;
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #10b981;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #10b981;
          animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
          position: relative;
        }

        .success-checkmark .check-icon {
          width: 56px;
          height: 56px;
          position: absolute;
          left: 12px;
          top: 12px;
          background: transparent;
        }

        .success-checkmark .icon-line {
          height: 3px;
          background-color: #10b981;
          display: block;
          border-radius: 2px;
          position: absolute;
          z-index: 10;
        }

        .success-checkmark .icon-line.line-tip {
          top: 28px;
          left: 8px;
          width: 20px;
          transform: rotate(45deg);
          animation: icon-line-tip 0.75s;
        }

        .success-checkmark .icon-line.line-long {
          top: 21px;
          right: 6px;
          width: 35px;
          transform: rotate(-45deg);
          animation: icon-line-long 0.75s;
        }

        .askora-modal-title {
          font-size: 2rem;
          font-weight: 600;
          color: white;
          margin: 0;
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .askora-modal-message {
          font-size: 1.1rem;
          color: #cbd5e1;
          line-height: 1.6;
          margin: 0;
          max-width: 400px;
        }

        .askora-modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 30px #10b981;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes icon-line-tip {
          0% {
            width: 0;
            left: 1px;
            top: 31px;
          }
          54% {
            width: 0;
            left: 1px;
            top: 31px;
          }
          70% {
            width: 20px;
            left: -2px;
            top: 31px;
          }
          84% {
            width: 17px;
            left: 1px;
            top: 28px;
          }
          100% {
            width: 20px;
            left: 8px;
            top: 28px;
          }
        }

        @keyframes icon-line-long {
          0% {
            width: 0;
            right: 26px;
            top: 24px;
          }
          65% {
            width: 0;
            right: 26px;
            top: 24px;
          }
          84% {
            width: 35px;
            right: 9px;
            top: 24px;
          }
          100% {
            width: 35px;
            right: 6px;
            top: 21px;
          }
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

          .askora-modal {
            width: 95%;
            margin: 1rem;
          }

          .askora-modal-content {
            padding: 2rem 1.5rem;
          }

          .askora-modal-title {
            font-size: 1.5rem;
          }

          .askora-modal-message {
            font-size: 1rem;
          }

          .askora-modal-icon {
            width: 60px;
            height: 60px;
          }

          .success-checkmark {
            width: 60px;
            height: 60px;
          }

          .success-checkmark .check-icon {
            width: 42px;
            height: 42px;
            left: 9px;
            top: 9px;
          }
        }
      `}</style>
    </div>
  );

}
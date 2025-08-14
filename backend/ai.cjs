// backend/ai.cjs
const express = require("express");
const router = express.Router();

const GEMINI_KEY = process.env.GEMINI_KEY; // put key in backend .env
const GEMINI_URL = GEMINI_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`
  : null;

// helper to produce a small, useful fallback feedback
function fallbackFeedback(question, answer) {
  const qPart = question ? `Q: "${question}". ` : "";
  const aPart = answer ? `A: "${answer}". ` : "";
  return (
    `${qPart}${aPart}Good attempt — to improve, be specific about what the concept means and give a short example or use-case. ` +
    `(This is fallback feedback because the AI service is not available.)`
  );
}

router.post("/feedback", async (req, res) => {
  try {
    const { question, answer } = req.body || {};
    if (!question || !answer) {
      return res.status(400).json({ error: "Missing question or answer" });
    }

    // If GEMINI_KEY not configured, return a fallback feedback so interview continues.
    if (!GEMINI_KEY || !GEMINI_URL) {
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ feedback: fb });
    }

    // Call Gemini (server-side) — Node 18+ has global fetch; otherwise install node-fetch.
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are a professional job interviewer. The candidate was asked: "${question}". Their answer was: "${answer}". Provide constructive feedback on strengths and areas for improvement in 2-4 concise sentences.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 200
      }
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // If Gemini fails, return fallback feedback (but still 200 so frontend continues)
    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      console.error("Gemini call failed:", response.status, txt);
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ feedback: fb });
    }

    const data = await response.json();
    const feedbackText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (!feedbackText) {
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ feedback: fb });
    }

    return res.status(200).json({ feedback: feedbackText });
  } catch (err) {
    console.error("AI proxy error:", err);
    // return safe fallback feedback
    const fb = fallbackFeedback(req.body?.question, req.body?.answer);
    return res.status(200).json({ feedback: fb });
  }
});

module.exports = router;

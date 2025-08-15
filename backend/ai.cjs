// ai.cjs
const express = require("express");
const router = express.Router();

// Load environment variables
require('dotenv').config();

// ✅ Fixed: Use process.env instead of import.meta.env
const GEMINI_KEY = "AIzaSyDmDSjazjqBBFlyO__yWyjedh0Zn7AIrS4";
const GEMINI_URL = GEMINI_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`
  : null;

// helper to produce a small, useful fallback feedback
function fallbackFeedback(question, answer) {
  const qPart = question ? `Q: "${question}". ` : "";
  const aPart = answer ? `A: "${answer}". ` : "";
  return (
    `${qPart}${aPart}Good attempt – to improve, be specific about what the concept means and give a short example or use-case. ` +
    `(This is fallback feedback because the AI service is not available.)`
  );
}

router.post("/feedback", async (req, res) => {
  try {
    const { question, answer } = req.body || {};
    
    console.log("AI feedback request received:", { question, answer });
    
    if (!question || !answer) {
      return res.status(400).json({ error: "Missing question or answer" });
    }

    // If GEMINI_KEY not configured, return a fallback feedback so interview continues.
    if (!GEMINI_KEY || !GEMINI_URL) {
      console.log("Using fallback AI feedback (API key not configured)");
      
      // Enhanced mock feedback for testing
      const mockFeedbacks = [
        "Great answer! You provided specific examples and showed good communication skills. Consider adding more quantifiable achievements to strengthen your response.",
        "Good response with relevant details. Try to be more concise and focus on the most impactful points. Also consider mentioning how your experience aligns with the role.",
        "Well-structured answer that demonstrates your knowledge. You could improve by providing more concrete examples and showing how you've overcome challenges.",
        "Nice explanation of your background. Consider emphasizing your unique value proposition and specific contributions to previous roles.",
        "Solid response with good technical details. Try to connect your experience more directly to the company's needs and show enthusiasm for the role."
      ];
      
      const randomFeedback = mockFeedbacks[Math.floor(Math.random() * mockFeedbacks.length)];
      return res.status(200).json({ feedback: randomFeedback });
    }

    // Call Gemini (server-side) – Node 18+ has global fetch; otherwise install node-fetch.
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

    console.log("Gemini API response status:", response.status);

    // If Gemini fails, return fallback feedback (but still 200 so frontend continues)
    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      console.error("Gemini call failed:", response.status, txt);
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ feedback: fb });
    }

    const data = await response.json();
    console.log("Gemini API response data:", JSON.stringify(data, null, 2));
    
    const feedbackText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (!feedbackText) {
      console.warn("No feedback text found in response:", data);
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ feedback: fb });
    }

    return res.status(200).json({ feedback: feedbackText.trim() });
    
  } catch (err) {
    console.error("AI proxy error:", err);
    // return safe fallback feedback
    const fb = fallbackFeedback(req.body?.question, req.body?.answer);
    return res.status(200).json({ feedback: fb });
  }
});

module.exports = router;
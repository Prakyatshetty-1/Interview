// backend/routes/ai.js  (ESM)
import express from "express";
import fetch from "node-fetch"; // If Node v18+ you can rely on global fetch
const router = express.Router();

const GEMINI_KEY = process.env.GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent?key=${GEMINI_KEY}`;

router.post("/feedback", async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  try {
    console.log("[AI proxy] request:", { questionSnippet: question.slice(0, 120), answerSnippet: answer.slice(0, 120) });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a professional job interviewer. The candidate was asked: "${question}". Their answer was: "${answer}". Provide constructive feedback on this answer in 3-4 sentences, focusing on strengths and areas for improvement. Keep it concise.`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text().catch(() => "");
    console.log("[AI proxy] raw response text length:", text ? text.length : 0);

    if (!response.ok) {
      // try to parse any error info, but fall back to friendly message
      try {
        const parsed = text ? JSON.parse(text) : {};
        return res.status(500).json({ feedback: parsed.error || "AI returned error" });
      } catch (e) {
        return res.status(500).json({ feedback: `AI service returned ${response.status}` });
      }
    }

    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn("[AI proxy] Could not parse JSON, returning fallback. Raw text:", text);
      return res.json({ feedback: "No feedback returned (invalid AI response)" });
    }

    // Gemni-style parsing: data.candidates[0].content.parts[0].text
    const feedbackText =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      json?.feedback ||
      json?.result ||
      null;

    if (!feedbackText) {
      console.warn("[AI proxy] No feedback found in AI response. Returning fallback object.");
      return res.json({ feedback: "No feedback returned by AI." });
    }

    // success
    return res.json({ feedback: feedbackText });
  } catch (err) {
    console.error("[AI proxy] Error calling AI:", err);
    if (err.name === "AbortError") {
      return res.status(504).json({ feedback: "AI request timed out" });
    }
    return res.status(500).json({ feedback: "AI service error" });
  }
});

export default router;

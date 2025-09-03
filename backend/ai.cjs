// ai.cjs
const express = require("express");
const router = express.Router();

// Load environment variables
require('dotenv').config();

// ✅ Use the correct environment variable name
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
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
    
    console.log("\n=== AI Feedback Request ===");
    console.log("Question:", question);
    console.log("Answer:", answer);
    console.log("GEMINI_KEY available:", !!GEMINI_KEY);
    
    if (!question || !answer) {
      console.log("❌ Missing question or answer");
      return res.status(400).json({ error: "Missing question or answer" });
    }

    // If GEMINI_KEY not configured, return a fallback feedback
    if (!GEMINI_KEY || !GEMINI_URL) {
      console.log("❌ Using fallback AI feedback (API key not configured)");
      
      const mockFeedbacks = [
        "Great answer! You provided specific examples and showed good communication skills. Consider adding more quantifiable achievements to strengthen your response.",
        "Good response with relevant details. Try to be more concise and focus on the most impactful points. Also consider mentioning how your experience aligns with the role.",
        "Well-structured answer that demonstrates your knowledge. You could improve by providing more concrete examples and showing how you've overcome challenges.",
        "Nice explanation of your background. Consider emphasizing your unique value proposition and specific contributions to previous roles.",
        "Solid response with good technical details. Try to connect your experience more directly to the company's needs and show enthusiasm for the role."
      ];
      
      const randomFeedback = mockFeedbacks[Math.floor(Math.random() * mockFeedbacks.length)];
      return res.status(200).json({ 
        feedback: randomFeedback,
        source: "fallback" // Add this to identify fallback responses
      });
    }

    console.log("🚀 Calling Gemini API...");

    // Improved prompt for better feedback
   const prompt = `You are a professional job interviewer and communication coach. Evaluate the candidate's interview response with balanced, practical feedback.  

QUESTION: "${question}"  

CANDIDATE'S ANSWER: "${answer}"  

Your feedback must:  
1. Point out specific strengths (content, clarity, tone, or relevance).  
2. Identify the most important areas that need improvement (avoid generic advice).  
3. Offer clear, actionable suggestions to make the answer stronger (e.g., structure, examples, confidence, detail).  
4. Keep the tone professional, supportive, and encouraging, while being honest.  

Write the feedback in 3–5 concise sentences, easy for the candidate to apply immediately.`;  
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
        topK: 40,
        topP: 0.95
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    console.log("📤 Sending request to Gemini...");
    
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "Interview-App/1.0"
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Gemini API response status:", response.status);

    // Get response text for better error handling
    const responseText = await response.text();
    console.log("📄 Raw response length:", responseText.length);

    if (!response.ok) {
      console.error("❌ Gemini call failed:", response.status);
      console.error("❌ Response text:", responseText);
      
      // Check for specific error types
      if (response.status === 400) {
        console.error("❌ Bad request - check API key and request format");
      } else if (response.status === 403) {
        console.error("❌ Forbidden - check API key permissions");
      } else if (response.status === 429) {
        console.error("❌ Rate limit exceeded");
      }
      
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ 
        feedback: fb,
        source: "fallback_api_error",
        error: `API Error: ${response.status}`
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("✅ Successfully parsed JSON response");
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError);
      console.error("❌ Response text:", responseText);
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ 
        feedback: fb,
        source: "fallback_parse_error"
      });
    }
    
    console.log("📊 Gemini response structure:", {
      candidates: data?.candidates?.length || 0,
      hasContent: !!data?.candidates?.[0]?.content,
      hasParts: !!data?.candidates?.[0]?.content?.parts?.length,
      hasText: !!data?.candidates?.[0]?.content?.parts?.[0]?.text
    });

    // More robust feedback extraction
    const feedbackText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!feedbackText) {
      console.warn("❌ No feedback text found in response");
      console.warn("Full response data:", JSON.stringify(data, null, 2));
      
      // Check if response was blocked by safety filters
      if (data?.candidates?.[0]?.finishReason === "SAFETY") {
        console.warn("⚠️ Response blocked by safety filters");
        return res.status(200).json({ 
          feedback: "Your response looks good! Try to provide more specific examples and demonstrate clear problem-solving skills in your answers.",
          source: "fallback_safety_filter"
        });
      }
      
      const fb = fallbackFeedback(question, answer);
      return res.status(200).json({ 
        feedback: fb,
        source: "fallback_no_text"
      });
    }

    console.log("✅ Successfully generated AI feedback");
    console.log("📝 Feedback:", feedbackText);

    return res.status(200).json({ 
      feedback: feedbackText,
      source: "gemini"
    });
    
  } catch (err) {
    console.error("❌ AI proxy error:", err);
    console.error("❌ Error stack:", err.stack);
    
    // return safe fallback feedback
    const fb = fallbackFeedback(req.body?.question, req.body?.answer);
    return res.status(200).json({ 
      feedback: fb,
      source: "fallback_exception",
      error: err.message
    });
  }
});

// Add a test endpoint to verify API key
router.get("/test", async (req, res) => {
  console.log("\n=== AI Test Endpoint ===");
  console.log("GEMINI_KEY available:", !!GEMINI_KEY);
  console.log("GEMINI_URL:", GEMINI_URL || "not configured");
  
  if (!GEMINI_KEY) {
    return res.status(200).json({
      status: "error",
      message: "GEMINI_API_KEY not configured",
      available: false
    });
  }

  try {
    const testPayload = {
      contents: [
        {
          parts: [
            {
              text: "Say 'Hello, the API is working correctly!'"
            }
          ]
        }
      ]
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    const testResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({
      status: response.ok ? "success" : "error",
      httpStatus: response.status,
      available: !!testResponse,
      message: testResponse || "No response received",
      fullResponse: data
    });

  } catch (error) {
    return res.status(200).json({
      status: "error",
      message: error.message,
      available: false
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { Interview } = require("./db.cjs"); // only use mongoose Interview
const SECRET_KEY = "askorishere";

// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// POST /interview/save
router.post("/save", authenticateToken, async (req, res) => {
  const { questions, title, category, difficulty, duration } = req.body;
  const userId = req.user.id;

  if (!questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: "Invalid questions format" });
  }

  try {
    const interview = new Interview({
      user: new ObjectId(userId),
      title: title || "Untitled Interview",
      category,
      difficulty,
      duration,
      questions: questions.map((q) => ({
        question: q.question,
        category: q.category || category,
        difficulty: q.difficulty || difficulty,
        expectedDuration: q.expectedDuration || duration || 5,
      })),
    });

    const savedInterview = await interview.save();
    res.status(201).json({ message: "Interview saved successfully", savedInterview });
  } catch (error) {
    console.error("Error saving interview:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

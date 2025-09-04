// interview.cjs
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { Interview } = require("./db.cjs"); // mongoose model
const User = require("./User.cjs");
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to check JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// ✅ Public route - Get ALL interview packs (no login needed)
router.get("/all", async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("user", "name") // show creator's name
      .lean()
      .exec();
    res.json(interviews);
  } catch (err) {
    console.error("Error fetching interviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Protected route - Save a new interview pack
router.post("/save", authenticateToken, async (req, res) => {
  try {
    const { questions, title, category, difficulty, duration, tags } = req.body;
    const userId = req.user.id;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid questions format" });
    }

    // Build interview doc
    const interview = new Interview({
      user: new ObjectId(userId),
      title: title || "Untitled Interview",
      category,
      difficulty,
      duration,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      questions: questions.map((q) => ({
        question: q.question,
        category: q.category || category,
        difficulty: q.difficulty || difficulty,
        expectedDuration: q.expectedDuration || duration || 5,
      })),
      // ensure createdAt exists (some models have timestamps: true, but set just in case)
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedInterview = await interview.save();

    // Increment user's stats.totalInterviews so profile/stats reflect creations
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $inc: { "stats.totalInterviews": 1 } },
        { new: true, runValidators: true }
      ).select('-password');

      // respond with both saved interview and updated user stats (frontend can use either)
      return res.status(201).json({
        message: "Interview saved successfully",
        savedInterview,
        user: updatedUser
      });
    } catch (uErr) {
      // if user update fails, still return saved interview but warn in logs
      console.error("Interview saved but failed to update user stats:", uErr);
      return res.status(201).json({
        message: "Interview saved successfully (user stats update failed)",
        savedInterview
      });
    }
  } catch (error) {
    console.error("Error saving interview:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Fixed Public route - Get interviews by tag
router.get("/by-tag/:tag", async (req, res) => {
  try {
    const tagParam = decodeURIComponent(req.params.tag).trim().toLowerCase();
    console.log("Searching for tag:", tagParam);
    
    // Fixed: Use $elemMatch to search within the tags array properly
    const interviews = await Interview.find({
      tags: { 
        $elemMatch: { 
          $regex: new RegExp(`^${tagParam}$`, "i") 
        } 
      }
    })
    .populate("user", "name") // Include creator's name
    .lean()
    .exec();
    
    console.log(`Found ${interviews.length} interviews for tag: ${tagParam}`);
    
    // If no exact matches, try partial matching as fallback
    if (interviews.length === 0) {
      console.log("No exact matches, trying partial search...");
      const partialMatches = await Interview.find({
        $or: [
          { tags: { $elemMatch: { $regex: new RegExp(tagParam, "i") } } },
          { category: { $regex: new RegExp(tagParam, "i") } },
          { title: { $regex: new RegExp(tagParam, "i") } }
        ]
      })
      .populate("user", "name")
      .lean()
      .exec();
      
      console.log(`Found ${partialMatches.length} partial matches`);
      return res.json(partialMatches);
    }
    
    res.json(interviews);
  } catch (err) {
    console.error("Error fetching interviews by tag:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Debug route to see what tags exist in the database
router.get("/debug/tags", async (req, res) => {
  try {
    const allInterviews = await Interview.find({}, { tags: 1, title: 1 }).lean().exec();
    const allTags = [];
    
    allInterviews.forEach(interview => {
      if (interview.tags && Array.isArray(interview.tags)) {
        allTags.push(...interview.tags);
      }
    });
    
    const uniqueTags = [...new Set(allTags)];
    
    res.json({
      totalInterviews: allInterviews.length,
      uniqueTags: uniqueTags.sort(),
      sampleInterviews: allInterviews.slice(0, 3)
    });
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Protected route - Get a single interview by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).lean().exec();
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json(interview);
  } catch (err) {
    console.error("Error fetching interview:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query;

    const pipeline = [];

    // If userId provided, match only that user's interviews
    if (userId) {
      // validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
      pipeline.push({ $match: { user: new mongoose.Types.ObjectId(userId) } });
    }

    // Unwind questions; preserveNullAndEmptyArrays not needed because we only want question docs
    pipeline.push(
      { $unwind: '$questions' },
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$questions.difficulty', 'unknown'] } },
          count: { $sum: 1 }
        }
      }
    );

    const agg = await Interview.aggregate(pipeline);

    let easy = 0, medium = 0, hard = 0;
    agg.forEach(item => {
      if (item._id === 'easy') easy = item.count;
      else if (item._id === 'medium') medium = item.count;
      else if (item._id === 'hard') hard = item.count;
      // other categories are ignored for the LeetCode meter, but you can keep them if needed
    });

    const total = easy + medium + hard;

    return res.json({
      total,
      easy: { total: easy },
      medium: { total: medium },
      hard: { total: hard }
    });
  } catch (err) {
    console.error('Error fetching interview stats:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
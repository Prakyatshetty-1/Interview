// interview.cjs
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { Interview } = require("./db.cjs"); // mongoose model
const User = require("./User.cjs");
const mongoose = require("mongoose"); 
const SECRET_KEY = process.env.SECRET_KEY;

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

router.get('/stats', async (req, res) => {
  try {
    console.log('[interview.stats] incoming query:', req.query);

    if (!Interview) {
      console.error('[interview.stats] Interview model missing');
      return res.status(500).json({ error: 'Server error: Interview model missing' });
    }

    const { userId } = req.query;

    // Helper to run aggregation that groups by difficulty
    const runAgg = async (matchFilter = {}) => {
  const pipeline = [
    { $match: matchFilter },
    // group by interview.difficulty, not per question
    {
      $group: {
        _id: { $toLower: { $ifNull: ['$difficulty', 'unknown'] } },
        count: { $sum: 1 }
      }
    }
  ];
  return Interview.aggregate(pipeline).allowDiskUse(true);
};


    // If a userId is provided, validate it and compute both user & overall counts
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }

      const userMatch = { user: new mongoose.Types.ObjectId(userId) };
      const [userAgg, globalAgg] = await Promise.all([runAgg(userMatch), runAgg({})]);

      console.log('[interview.stats] userAgg:', userAgg);
      console.log('[interview.stats] globalAgg:', globalAgg);

      const toCounts = (agg) => {
        let easy = 0, medium = 0, hard = 0;
        (agg || []).forEach(item => {
          if (!item || typeof item._id === 'undefined' || item._id === null) return;
          const key = String(item._id).trim().toLowerCase();
          if (key === 'easy') easy = item.count;
          else if (key === 'medium') medium = item.count;
          else if (key === 'hard') hard = item.count;
        });
        return { total: easy + medium + hard, easy, medium, hard };
      };

      const userCounts = toCounts(userAgg);
      const globalCounts = toCounts(globalAgg);

      return res.json({
        user: {
          total: userCounts.total,
          easy: { total: userCounts.easy },
          medium: { total: userCounts.medium },
          hard: { total: userCounts.hard }
        },
        global: {
          total: globalCounts.total,
          easy: { total: globalCounts.easy },
          medium: { total: globalCounts.medium },
          hard: { total: globalCounts.hard }
        }
      });
    }

    // No userId: return global counts only
    const globalAgg = await runAgg({});
    console.log('[interview.stats] globalAgg:', globalAgg);

    let easy = 0, medium = 0, hard = 0;
    (globalAgg || []).forEach(item => {
      const key = String(item._id).trim().toLowerCase();
      if (key === 'easy') easy = item.count;
      else if (key === 'medium') medium = item.count;
      else if (key === 'hard') hard = item.count;
    });

    const total = easy + medium + hard;
    return res.json({
      total,
      easy: { total: easy },
      medium: { total: medium },
      hard: { total: hard }
    });

  } catch (err) {
    console.error('[interview.stats] ERROR:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error', detail: err?.message ?? String(err) });
  }
});

router.get('/stats-simple', async (req, res) => {
  try {
    console.log('[interview.stats-simple] incoming query:', req.query);

    if (!Interview) {
      console.error('[interview.stats-simple] Interview model missing');
      return res.status(500).json({ error: 'Server error: Interview model missing' });
    }

    const { userId } = req.query;
    const filter = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
      filter.user = new mongoose.Types.ObjectId(userId);
    }

    const docs = await Interview.find(filter, { questions: 1 }).lean().exec();

    let easy = 0, medium = 0, hard = 0;
    for (const doc of docs) {
  const key = doc.difficulty ? String(doc.difficulty).trim().toLowerCase() : null;
  if (key === 'easy') easy++;
  else if (key === 'medium') medium++;
  else if (key === 'hard') hard++;
}


    const total = easy + medium + hard;
    console.log('[interview.stats-simple] counts:', { total, easy, medium, hard, docsCount: docs.length });

    return res.json({
      total,
      easy: { total: easy },
      medium: { total: medium },
      hard: { total: hard }
    });
  } catch (err) {
    console.error('[interview.stats-simple] ERROR:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error', detail: err?.message ?? String(err) });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).lean().exec();
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json(interview);
  } catch (err) {
    console.error("Error fetching interview by id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
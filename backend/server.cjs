// server.cjs
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User.cjs');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/interview-app';
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'askorishere';
const interviewRoutes = require("./interview.cjs");
const { connectToDb, Interview } = require('./db.cjs'); // ensure db.cjs exports Interview and connectToDb

const aiRoutes = require("./ai.cjs");

console.log("Starting server...");

// ✅ CORS configuration - THIS MUST BE BEFORE OTHER MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://127.0.0.1:5173',  // Alternative localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// ✅ Body parser middleware
app.use(express.json());

// ✅ Add AI routes AFTER CORS and body parser
app.use("/api/ai", aiRoutes);

// ✅ Add other routes (interview router)
app.use('/api/interviews', interviewRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('API is working');
});

// ✅ Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Database connection and server startup
connectToDb().then(() => {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`CORS enabled for: http://localhost:5173`);
      });
    })
    .catch(err => {
      console.error('Error connecting to MongoDB (Mongoose):', err.message);
    });
}).catch(err => {
  console.error('Database connection failed:', err);
});

// ✅ Auth routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '1h'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/signup', async (req, res) => {
  try {
    console.log('Received signup data:', req.body);

    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log('User saved:', newUser);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// -------------------------------
// NEW: Public route to list users
// GET /api/users?q=optionalSearch
// -------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    let filter = {};

    if (q) {
      // case-insensitive search across several user fields
      const re = new RegExp(q, 'i');
      filter = {
        $or: [
          { name: re },
          { username: re },
          { fullName: re },
          { company: re },
          { education: re },
          { favoriteTopics: re },
          { interests: re }
        ]
      };
    }

    // select only useful fields for listing; exclude sensitive data
    const users = await User.find(filter)
      .select('-password -email -attempts -saves -__v')
      .lean()
      .exec();

    // optional: map to ensure consistent frontend shape
    const mapped = (users || []).map(u => ({
      _id: u._id,
      name: u.name || u.fullName || '',
      username: u.username || u.name || '',
      fullName: u.fullName || '',
      profilePicture: u.profilePicture || u.profileImage || '',
      company: u.company || '',
      education: u.education || '',
      favoriteTopics: u.favoriteTopics || [],
      interests: u.interests || [],
      stats: u.stats || {},
      aboutText: u.aboutText || '',
    }));

    res.status(200).json(mapped);
  } catch (err) {
    console.error('Error fetching users list:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Profile routes
// Get user profile (current logged-in user)
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this route
    delete updateData.password;
    delete updateData.email;
    delete updateData._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update specific profile fields
app.patch('/api/profile/about', authMiddleware, async (req, res) => {
  try {
    console.log('=== PATCH /api/profile/about ===');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);

    const { aboutText } = req.body;

    // Validate input
    if (aboutText === undefined) {
      console.log('❌ aboutText is undefined');
      return res.status(400).json({ message: 'aboutText is required' });
    }

    console.log('About text to save:', aboutText);

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { aboutText },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User updated successfully');
    console.log('New aboutText:', updatedUser.aboutText);

    res.status(200).json({
      message: 'About section updated successfully',
      aboutText: updatedUser.aboutText,
      user: updatedUser // Include full user data for frontend update
    });
  } catch (error) {
    console.error('❌ Error updating about:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user stats (for when user completes interviews, etc.)
app.patch('/api/profile/stats', authMiddleware, async (req, res) => {
  try {
    const { stats } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { stats } },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Stats updated successfully',
      stats: updatedUser.stats
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by username (for viewing other profiles)
app.get('/api/profile/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Preference routes
const Preference = require('./Preference.cjs');

app.post('/api/preference', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { answers } = req.body;

  try {
    const newPref = new Preference({ userId, answers });
    await newPref.save();
    res.status(201).json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error.message);
    res.status(500).json({ message: 'Error saving preferences', error: error.message });
  }
});

app.get('/api/preference/check', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const existing = await Preference.findOne({ userId });

    if (existing) {
      return res.status(200).json({ alreadySubmitted: true });
    } else {
      return res.status(200).json({ alreadySubmitted: false });
    }
  } catch (error) {
    console.error('Error checking preferences:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Interview routes by tag - fixed to use Interview model
app.get("/api/interviews/by-tag/:tag", async (req, res) => {
  try {
    const tagParam = decodeURIComponent(req.params.tag).trim().toLowerCase();
    const results = await Interview.find({
      tags: { $regex: new RegExp(`^${tagParam}$`, "i") }
    }).lean().exec();
    res.json(results);
  } catch (err) {
    console.error('Error fetching interviews by tag:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ------------------------------
   Contributions endpoint
   Aggregates interview packs created by the logged-in user over the last 365 days
   Returns an array of { date: 'YYYY-MM-DD', createdCount, createdLevel, level }
   ------------------------------ */
function mapCreatedCountToLevel(count) {
  if (!count || count <= 0) return 0;
  if (count >= 4) return 4;
  if (count === 3) return 3;
  if (count === 2) return 2;
  return 1; // count === 1
}

app.get('/api/profile/contributions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);

    const dayKey = (d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    };

    // 1) Interviews created by this user
    const interviewsCreated = await Interview.find({
      user: userId,
      createdAt: { $gte: lastYear }
    }).select('createdAt').lean();

    const createdMap = new Map();
    interviewsCreated.forEach(iv => {
      const k = dayKey(iv.createdAt);
      createdMap.set(k, (createdMap.get(k) || 0) + 1);
    });

    // 2) Attempts logged by this user
    const user = await User.findById(userId).select('attempts').lean();
    const attempts = (user?.attempts || []).filter(a => a.date && new Date(a.date) >= lastYear);

    const attemptMap = new Map();
    attempts.forEach(at => {
      const k = dayKey(at.date);
      attemptMap.set(k, (attemptMap.get(k) || 0) + 1);
    });

    // 3) Merge into daily records
    const days = [];
    for (let d = new Date(lastYear); d <= today; d.setDate(d.getDate() + 1)) {
      const k = dayKey(d);
      const createdCount = createdMap.get(k) || 0;
      const attemptCount = attemptMap.get(k) || 0;
      const totalCount = createdCount + attemptCount;

      // Map to levels (1–4)
      const mapToLevel = (count) => count >= 4 ? 4 : count;
      const createdLevel = mapToLevel(createdCount);
      const attemptLevel = mapToLevel(attemptCount);
      const level = mapToLevel(totalCount);

      days.push({
        date: k,
        createdCount,
        attemptCount,
        createdLevel,
        attemptLevel,
        level
      });
    }

    res.status(200).json(days);
  } catch (err) {
    console.error('Error fetching contributions (packs+attempts):', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/* ------------------------------
  (rest of your routes unchanged... attempts, saves etc.)
  ------------------------------ */

// Get saved items
app.get('/api/saved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('saves');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.saves);
  } catch (error) {
    console.error('Error fetching saved items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save an interview for current user
app.post('/api/save', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { interviewId = null, title, imageUrl } = req.body;

    if (!title) return res.status(400).json({ message: 'title is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = user.saves.some(s => {
      if (interviewId && s.interviewId) return s.interviewId === interviewId;
      return s.title === title && s.imageUrl === imageUrl;
    });

    if (exists) return res.status(400).json({ message: 'Already saved' });

    user.saves.push({ interviewId, title, imageUrl });
    await user.save();

    res.status(201).json({ message: 'Saved successfully', saves: user.saves });
  } catch (error) {
    console.error('Error saving item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unsave
app.delete('/api/unsave', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { interviewId = null, title, imageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.saves = user.saves.filter(s => {
      if (interviewId && s.interviewId) return s.interviewId !== interviewId;
      return !(s.title === title && s.imageUrl === imageUrl);
    });

    await user.save();
    res.status(200).json({ message: 'Unsaved successfully', saves: user.saves });
  } catch (error) {
    console.error('Error unsaving item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Attempts (POST/GET/DELETE)
app.post('/api/profile/attempts', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { interviewId = null, date = null, level = 1, outcome = '', notes = '' } = req.body;

    const attemptDate = date ? new Date(date) : new Date();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.attempts.push({ interviewId, date: attemptDate, level, outcome, notes });
    await user.save();

    res.status(201).json({ message: 'Attempt recorded', attempt: user.attempts[user.attempts.length - 1] });
  } catch (err) {
    console.error('Error recording attempt:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/api/profile/attempts', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('attempts');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const attempts = (user.attempts || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    res.status(200).json(attempts);
  } catch (err) {
    console.error('Error fetching attempts:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.delete('/api/profile/attempts/:attemptId', authMiddleware, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.attempts = user.attempts.filter(a => String(a._id) !== String(attemptId));
    await user.save();

    res.status(200).json({ message: 'Attempt removed' });
  } catch (err) {
    console.error('Error deleting attempt:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET user by id (public)
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    const user = await User.findById(id).select('-password -email -attempts -saves -__v').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Map shape (optional)
    const mapped = {
      _id: user._id,
      name: user.name || user.fullName || '',
      username: user.username || user.name || '',
      fullName: user.fullName || '',
      profilePicture: user.profilePicture || user.profileImage || '',
      company: user.company || '',
      education: user.education || '',
      favoriteTopics: user.favoriteTopics || [],
      interests: user.interests || [],
      stats: user.stats || {},
      aboutText: user.aboutText || ''
    };

    res.status(200).json(mapped);
  } catch (err) {
    console.error('Error fetching user by id:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public contributions for any user (no auth) - Add in server.cjs
app.get('/api/users/:id/contributions', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);

    const dayKey = (d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
    };

    // Interviews created by this user in last year
    const interviewsCreated = await Interview.find({
      user: id,
      createdAt: { $gte: lastYear }
    }).select('createdAt').lean();

    const createdMap = new Map();
    interviewsCreated.forEach(iv => {
      const k = dayKey(iv.createdAt);
      createdMap.set(k, (createdMap.get(k) || 0) + 1);
    });

    // Attempts logged by this user (attempts is stored as part of User)
    const user = await User.findById(id).select('attempts').lean();
    const attempts = (user?.attempts || []).filter(a => a.date && new Date(a.date) >= lastYear);

    const attemptMap = new Map();
    attempts.forEach(at => {
      const k = dayKey(at.date);
      attemptMap.set(k, (attemptMap.get(k) || 0) + 1);
    });

    // Merge into daily records across the year
    const days = [];
    for (let d = new Date(lastYear); d <= today; d.setDate(d.getDate() + 1)) {
      const k = dayKey(d);
      const createdCount = createdMap.get(k) || 0;
      const attemptCount = attemptMap.get(k) || 0;
      const totalCount = createdCount + attemptCount;

      const mapToLevel = (count) => count >= 4 ? 4 : count;
      const createdLevel = mapToLevel(createdCount);
      const attemptLevel = mapToLevel(attemptCount);
      const level = mapToLevel(totalCount);

      days.push({
        date: k,
        createdCount,
        attemptCount,
        createdLevel,
        attemptLevel,
        level
      });
    }

    res.status(200).json(days);
  } catch (err) {
    console.error('Error fetching public contributions:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET own leetcode stats (authenticated)
app.get('/api/leetcode/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('leetcodeStats').lean();
    const defaultStats = {
      total: 0,
      attempting: 0,
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 }
    };
    res.status(200).json({ leetcodeStats: user?.leetcodeStats || defaultStats });
  } catch (err) {
    console.error('Error fetching leetcode stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update own leetcode stats (authenticated)
app.put('/api/leetcode/stats', authMiddleware, async (req, res) => {
  try {
    const { leetcodeStats } = req.body;
    if (!leetcodeStats) return res.status(400).json({ message: 'leetcodeStats required' });

    const updated = await User.findByIdAndUpdate(req.user.id, { $set: { leetcodeStats } }, { new: true }).select('leetcodeStats').lean();
    res.status(200).json({ message: 'LeetCode stats updated', leetcodeStats: updated.leetcodeStats });
  } catch (err) {
    console.error('Error updating leetcode stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public: get another user's leetcode stats (no auth)
app.get('/api/users/:id/leetcode-stats', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    const user = await User.findById(id).select('leetcodeStats').lean();
    const defaultStats = {
      total: 0,
      attempting: 0,
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 }
    };

    res.status(200).json({ leetcodeStats: user?.leetcodeStats || defaultStats });
  } catch (err) {
    console.error('Error fetching public leetcode stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

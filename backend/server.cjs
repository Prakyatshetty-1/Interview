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
const { connectToDb } = require('./db.cjs');

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

// ✅ Add other routes
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

// ✅ Profile routes
// Get user profile
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

// ✅ Interview routes
app.get("/api/interviews/by-tag/:tag", (req, res) => {
  const tagParam = decodeURIComponent(req.params.tag).trim().toLowerCase();
  const results = interviews.filter(iv => 
    iv.tags?.some(t => t.trim().toLowerCase() === tagParam)
  );
  res.json(results);
});

// Add these routes to your server.cjs file after the existing profile routes

// ✅ LeetCode Stats routes

// Get user's LeetCode stats
app.get('/api/leetcode/stats', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('leetcodeStats');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'LeetCode stats retrieved successfully',
      leetcodeStats: user.leetcodeStats
    });
  } catch (error) {
    console.error('Error fetching LeetCode stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user's LeetCode stats
app.put('/api/leetcode/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { leetcodeStats } = req.body;

    console.log('Updating LeetCode stats for user:', userId);
    console.log('New stats:', leetcodeStats);

    // Add lastUpdated timestamp
    leetcodeStats.lastUpdated = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { leetcodeStats },
      { new: true, runValidators: true }
    ).select('leetcodeStats');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'LeetCode stats updated successfully',
      leetcodeStats: updatedUser.leetcodeStats
    });
  } catch (error) {
    console.error('Error updating LeetCode stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update specific LeetCode problem counts
app.patch('/api/leetcode/stats/problems', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { difficulty, increment = 1 } = req.body; // difficulty: 'easy', 'medium', 'hard'

    console.log(`Incrementing ${difficulty} problems by ${increment} for user:`, userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Increment the solved count for the specified difficulty
    if (difficulty === 'easy') {
      user.leetcodeStats.easy.solved += increment;
    } else if (difficulty === 'medium') {
      user.leetcodeStats.medium.solved += increment;
    } else if (difficulty === 'hard') {
      user.leetcodeStats.hard.solved += increment;
    } else {
      return res.status(400).json({ message: 'Invalid difficulty level' });
    }

    user.leetcodeStats.lastUpdated = new Date();
    await user.save();

    res.status(200).json({
      message: `${difficulty} problem count updated successfully`,
      leetcodeStats: user.leetcodeStats
    });
  } catch (error) {
    console.error('Error updating problem count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update attempting count
app.patch('/api/leetcode/stats/attempting', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { attempting } = req.body;

    console.log(`Setting attempting count to ${attempting} for user:`, userId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        'leetcodeStats.attempting': attempting,
        'leetcodeStats.lastUpdated': new Date()
      },
      { new: true, runValidators: true }
    ).select('leetcodeStats');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Attempting count updated successfully',
      leetcodeStats: updatedUser.leetcodeStats
    });
  } catch (error) {
    console.error('Error updating attempting count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

    // Avoid duplicates: check by interviewId if provided, else by title+imageUrl
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

// Unsave: remove saved interview for current user
app.delete('/api/unsave', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { interviewId = null, title, imageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove by interviewId if provided, else match title+imageUrl
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

// POST /api/profile/attempts  -> add a new attempt for the logged-in user
app.post('/api/profile/attempts', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { interviewId = null, date = null, level = 1, outcome = '', notes = '' } = req.body;

    // date fallback
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

// GET /api/profile/attempts -> get attempts for logged-in user
app.get('/api/profile/attempts', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('attempts');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return attempts sorted by date ascending
    const attempts = (user.attempts || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    res.status(200).json(attempts);
  } catch (err) {
    console.error('Error fetching attempts:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Optional: delete an attempt (by attempt _id)
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

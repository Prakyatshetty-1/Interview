// server.cjs
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User.cjs');
const bcrypt = require('bcrypt');
const app = express();
require("dotenv").config();

const PORT = 5000;
const MONGO_URI = process.env.MONGO_URI;
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const interviewRoutes = require("./interview.cjs");
const { connectToDb } = require('./db.cjs');
const { Interview } = require("./db.cjs");
const aiRoutes = require("./ai.cjs");

console.log("Starting server...");

// ✅ CORS configuration - THIS MUST BE BEFORE OTHER MIDDLEWARE
// app.use(cors({
//   origin: [
//     'http://localhost:5173',  // Vite dev server
//     'http://127.0.0.1:5173',  // Alternative localhost
//     'https://askora-ai.vercel.app',
//     'https://interview-nxbs.onrender.com'
//   ],
//   credentials: true,
//   // include PATCH here (and any other methods you expect)
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   optionsSuccessStatus: 200 // For legacy browser support
// }));

// // Handle preflight requests explicitly with same options to ensure PATCH is allowed
// app.options('*', cors({
//   origin: [
//     'http://localhost:5173',
//     'http://127.0.0.1:5173',
//     'https://askora-ai.vercel.app',
//     'https://interview-nxbs.onrender.com'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   optionsSuccessStatus: 200
// }));

// Optional fallback — this makes sure the header is present if some middleware later overrides it
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});


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

// ✅ Helper Functions for Google Auth
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Database connection and server startup

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server is running on port`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB (Mongoose):', err.message);
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
      expiresIn: '7d'
    });


    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        authProvider: user.authProvider || 'local',
        photoURL: user.photoURL
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/signup', async (req, res) => {
  try {
    console.log('Received signup data:', req.body);

    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    const newUser = new User({ 
      name, 
      email, 
      password,
      authProvider: 'local',
      lastLogin: new Date()
    });
    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, SECRET_KEY, {
      expiresIn: '7d'
    });

    console.log('User saved:', newUser.email);
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        authProvider: newUser.authProvider,
        photoURL: newUser.photoURL
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});


// 🆕 Google Authentication Route
// Modified server.cjs - Separate Google Signup and Login endpoints

// 🆕 Google Sign Up Route (for new users)
app.post('/google-signup', async (req, res) => {
  try {
    console.log('Received Google signup data:', req.body);
    
    const { name, email, uid, photoURL } = req.body;

    // Validation
    if (!name || !email || !uid) {
      return res.status(400).json({ 
        message: 'Missing required Google authentication data' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email address from Google' 
      });
    }

    // Check if user already exists with this Google ID
    let existingGoogleUser = await User.findOne({ googleId: uid });
    if (existingGoogleUser) {
      return res.status(400).json({ 
        message: 'An account with this Google account already exists. Please use Sign In instead.',
        code: 'USER_EXISTS'
      });
    }

    // Check if user exists with same email but different provider
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
    if (existingEmailUser && !existingEmailUser.googleId) {
      return res.status(400).json({ 
        message: 'An account with this email already exists with email/password. Please sign in with your password or use a different email.',
        code: 'EMAIL_EXISTS'
      });
    }

    // Create new Google user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      googleId: uid,
      photoURL: photoURL || null,
      authProvider: 'google',
      lastLogin: new Date()
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '7d'
    });

    console.log('New Google user created:', user.email);

    res.status(201).json({
      message: 'Google account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        authProvider: user.authProvider,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ 
      message: 'Internal server error during Google signup' 
    });
  }
});

// 🆕 Google Login Route (for existing users)
app.post('/google-login', async (req, res) => {
  try {
    console.log('Received Google login data:', req.body);
    
    const { name, email, uid, photoURL } = req.body;

    // Validation
    if (!name || !email || !uid) {
      return res.status(400).json({ 
        message: 'Missing required Google authentication data' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email address from Google' 
      });
    }

    // Find user with this Google ID
    let user = await User.findOne({ googleId: uid });
    
    if (!user) {
      // Check if user exists with same email but different provider
      const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
      if (existingEmailUser && !existingEmailUser.googleId) {
        return res.status(400).json({ 
          message: 'An account with this email exists but was created with email/password. Please sign in with your password.',
          code: 'DIFFERENT_AUTH_METHOD'
        });
      }
      
      // User doesn't exist at all
      return res.status(404).json({
        message: 'No account found with this Google account. Please sign up first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // User exists - perform login
    user.lastLogin = new Date();
    // Update photo URL if it has changed
    if (photoURL && photoURL !== user.photoURL) {
      user.photoURL = photoURL;
    }
    await user.save();
    
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '7d'
    });
    
    console.log('Google user logged in:', user.email);
    
    res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        authProvider: user.authProvider,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      message: 'Internal server error during Google login' 
    });
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

// PATCH /api/profile/about
app.patch('/api/profile/about', authMiddleware, async (req, res) => {
  try {
    const aboutText =
      req.body?.aboutText ?? req.body?.about ?? req.body?.description;

    if (aboutText == null) {
      return res.status(400).json({ message: 'aboutText is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { aboutText: String(aboutText) } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'About section updated successfully',
      aboutText: updatedUser.aboutText,
      user: updatedUser
    });
  } catch (error) {
    console.error('PATCH /api/profile/about error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
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

// GET public user by id (public)
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    // find by _id
    const user = await User.findById(id)
      .select('-password -email -attempts -saves -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('Error fetching user by id:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ✅ Preference routes
const Preference = require('./Preference.cjs');

// Replace the existing app.post('/api/preference', ...) handler with this:
app.post('/api/preference', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { answers } = req.body;

  try {
    console.log('Saving preferences for user:', userId);
    console.log('Answers received:', JSON.stringify(answers).slice(0, 1000)); // truncated log

    // Save the Preference doc
    const newPref = new Preference({ userId, answers });
    await newPref.save();

    // Helper to retrieve step answers whether key is numeric or string
    const getStep = (k) => {
      if (!answers) return undefined;
      return answers[k] ?? answers[String(k)] ?? undefined;
    };

    // Try to extract company and education from known step structure
    let companyVal = '';
    let educationVal = '';

    // Step 0 in your UI contains 'experience' (companies / years)
    const step0 = getStep(0);
    if (step0 && typeof step0 === 'object') {
      companyVal = (step0.experience || step0.company || '').trim();
    }

    // Step 1 contains 'college' and 'field' (college -> education)
    const step1 = getStep(1);
    if (step1 && typeof step1 === 'object') {
      educationVal = (step1.college || step1.field || '').trim();
    }

    // Fallback: scan all answers for keys that look like company/experience/college
    if (!companyVal || !educationVal) {
      for (const k of Object.keys(answers || {})) {
        const v = answers[k];
        if (!v) continue;
        if (typeof v === 'object') {
          if (!companyVal && (v.experience || v.company)) {
            companyVal = (v.experience || v.company || '').trim();
          }
          if (!educationVal && (v.college || v.education || v.field)) {
            educationVal = (v.college || v.education || v.field || '').trim();
          }
        } else if (!educationVal && typeof v === 'string' && /college|university|institute/i.test(v)) {
          educationVal = v.trim();
        }
        if (companyVal && educationVal) break;
      }
    }

    // Update the User document if we found values (otherwise leave as-is)
    const update = {};
    if (companyVal) update.company = companyVal;
    if (educationVal) update.education = educationVal;

    if (Object.keys(update).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('-password').lean();
      console.log('Updated user with preference-derived fields:', {
        id: userId,
        company: updatedUser?.company,
        education: updatedUser?.education
      });
    } else {
      console.log('No company/education found in answers — user doc unchanged.');
    }

    res.status(201).json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
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
app.get("/api/interviews/by-tag/:tag", async (req, res) => {
  try {
    console.log("Tag-based interview search requested");
    
    const tagParam = decodeURIComponent(req.params.tag).trim().toLowerCase();
    console.log("Searching for tag:", tagParam);

    // Assuming your Interview model/collection exists
    // You'll need to create an Interview model if you haven't already
    const Interview = mongoose.model('Interview'); // Adjust this based on your model
    
    const results = await Interview.find({
      tags: {
        $elemMatch: {
          $regex: new RegExp(`^${tagParam}$`, 'i') // Case-insensitive exact match
        }
      }
    });

    console.log("Found interviews:", results.length);
    res.json(results);
    
  } catch (error) {
    console.error("Error fetching interviews by tag:", error);
    res.status(500).json({ 
      message: "Error fetching interviews", 
      error: error.message 
    });
  }
});

// Alternative approach if you need to search in a more flexible way
app.get("/api/interviews/by-tag-flexible/:tag", async (req, res) => {
  try {
    const tagParam = decodeURIComponent(req.params.tag).trim().toLowerCase();
    
    // Multiple search strategies
    const results = await Interview.find({
      $or: [
        // Exact match (case-insensitive)
        { tags: { $elemMatch: { $regex: new RegExp(`^${tagParam}$`, 'i') } } },
        // Partial match in category
        { category: { $regex: new RegExp(tagParam, 'i') } },
        // Partial match in title
        { title: { $regex: new RegExp(tagParam, 'i') } }
      ]
    });

    res.json(results);
    
  } catch (error) {
    console.error("Error fetching interviews by tag:", error);
    res.status(500).json({ 
      message: "Error fetching interviews", 
      error: error.message 
    });
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

// Add this to server.cjs (for example, before your profile routes)
app.get('/api/users', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    let filter = {};

    if (q) {
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

    const users = await User.find(filter)
      .select('-password -email -attempts -saves -__v')
      .lean()
      .exec();

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

app.post('/api/leetcode/update-after-interview', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let { difficulty, questionsCompleted = 1, packId } = req.body;

    if (!difficulty) {
      return res.status(400).json({ message: 'Difficulty is required' });
    }

    if (!packId) {
      return res.status(400).json({ message: 'Pack ID is required for tracking' });
    }

    // Normalize difficulty to match our schema (easy, medium, hard)
    const normalizedDifficulty = difficulty.toLowerCase().trim();
    
    if (!['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty. Must be easy, medium, or hard' });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if pack was already completed
    const alreadyCompleted = user.hasCompletedPack(packId);
    
    if (alreadyCompleted) {
      console.log(`User ${userId} already completed pack ${packId} - skipping LeetCode update`);
      return res.status(200).json({
        message: 'Pack already completed - LeetCode stats not updated',
        alreadyCompleted: true,
        leetcodeStats: user.leetcodeStats,
        updated: false
      });
    }

    // Initialize leetcodeStats if not exists
    if (!user.leetcodeStats) {
      user.leetcodeStats = {
        total: 3632,
        attempting: 0,
        easy: { solved: 0, total: 886 },
        medium: { solved: 0, total: 1889 },
        hard: { solved: 0, total: 857 }
      };
    }

    // Update the solved count for the specific difficulty
    const currentSolved = user.leetcodeStats[normalizedDifficulty].solved || 0;
    const newSolved = currentSolved +1;
    
    // Update the stats
    user.leetcodeStats[normalizedDifficulty].solved = newSolved;
    user.leetcodeStats.lastUpdated = new Date();

    // Mark pack as completed to prevent future updates
    const addedCompletion = user.addCompletedPack(packId, normalizedDifficulty, questionsCompleted);
    
    if (!addedCompletion) {
      console.warn(`Failed to add completion for pack ${packId} - may already exist`);
    }

    // Also update attempting count (optional)
    if (user.leetcodeStats.attempting > 0) {
      user.leetcodeStats.attempting = Math.max(0, user.leetcodeStats.attempting - questionsCompleted);
    }

    // Save the updated user
    await user.save();

    console.log(`Updated LeetCode stats for user ${userId}: ${normalizedDifficulty} +${questionsCompleted} (pack: ${packId})`);

    res.status(200).json({
      message: 'LeetCode stats updated successfully',
      leetcodeStats: user.leetcodeStats,
      updated: {
        difficulty: normalizedDifficulty,
        questionsCompleted,
        newSolved,
        packId,
        firstCompletion: true
      },
      alreadyCompleted: false
    });

  } catch (error) {
    console.error('Error updating LeetCode stats after interview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/leetcode/check-completion/:packId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { packId } = req.params;

    if (!packId) {
      return res.status(400).json({ message: 'Pack ID is required' });
    }


    const user = await User.findById(userId).select('completedPacks').lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const hasCompleted = user.completedPacks && user.completedPacks.some(pack => 
      String(pack.packId) === String(packId)
    );

    console.log(`Pack completion check - User: ${userId}, Pack: ${packId}, Completed: ${hasCompleted}`);

    res.status(200).json({
      hasCompleted,
      packId,
      completionDate: hasCompleted 
        ? user.completedPacks.find(pack => String(pack.packId) === String(packId))?.completedAt 
        : null
    });

  } catch (error) {
    console.error('Error checking pack completion:', error);

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Optional: Reset completion status for a pack (useful for testing)
app.delete('/api/leetcode/reset-completion/:packId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { packId } = req.params;

    if (!packId) {
      return res.status(400).json({ message: 'Pack ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the pack from completedPacks
    if (user.completedPacks) {
      const originalLength = user.completedPacks.length;
      user.completedPacks = user.completedPacks.filter(pack => 
        String(pack.packId) !== String(packId)
      );
      
      const removedCount = originalLength - user.completedPacks.length;
      
      if (removedCount > 0) {
        await user.save();
        console.log(`Reset completion status for pack ${packId}, user ${userId}`);
        
        res.status(200).json({
          message: `Reset completion status for pack ${packId}`,
          removed: removedCount,
          remainingCompletions: user.completedPacks.length
        });
      } else {
        res.status(404).json({
          message: 'Pack completion not found'
        });
      }
    } else {
      res.status(404).json({
        message: 'No completed packs found'
      });
    }

  } catch (error) {
    console.error('Error resetting pack completion:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add these routes to your server.cjs file after the existing Google authentication routes



// GitHub Sign Up Route (for new users)
app.post('/github-signup', async (req, res) => {
  try {
    console.log('Received GitHub signup data:', req.body);
    
    const { name, email, uid, photoURL } = req.body;

    // Validation
    if (!name || !email || !uid) {
      return res.status(400).json({ 
        message: 'Missing required GitHub authentication data' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email address from GitHub' 
      });
    }

    // Check if user already exists with this GitHub ID
    let existingGitHubUser = await User.findOne({ githubId: uid });
    if (existingGitHubUser) {
      return res.status(400).json({ 
        message: 'An account with this GitHub account already exists. Please use Sign In instead.',
        code: 'USER_EXISTS'
      });
    }

    // Check if user exists with same email but different provider
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
    if (existingEmailUser && !existingEmailUser.githubId) {
      return res.status(400).json({ 
        message: 'An account with this email already exists. Please use your existing login method.',
        code: 'EMAIL_EXISTS'
      });
    }

    // Create new GitHub user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      githubId: uid,
      photoURL: photoURL || '',
      authProvider: 'github',
      lastLogin: new Date()
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '7d'
    });

    console.log('New GitHub user created:', user.email);

    res.status(201).json({
      message: 'GitHub account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        authProvider: user.authProvider,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    console.error('GitHub signup error:', error);
    res.status(500).json({ 
      message: 'Internal server error during GitHub signup' 
    });
  }
});

// GitHub Login Route (for existing users)
app.post('/github-login', async (req, res) => {
  try {
    console.log('Received GitHub login data:', req.body);
    
    const { name, email, uid, photoURL } = req.body;

    // Validation
    if (!name || !email || !uid) {
      return res.status(400).json({ 
        message: 'Missing required GitHub authentication data' 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email address from GitHub' 
      });
    }

    // Find user with this GitHub ID
    let user = await User.findOne({ githubId: uid });
    
    if (!user) {
      // Check if user exists with same email but different provider
      const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
      if (existingEmailUser && !existingEmailUser.githubId) {
        return res.status(400).json({ 
          message: 'An account with this email exists but was created with a different method. Please use your original login method.',
          code: 'DIFFERENT_AUTH_METHOD'
        });
      }
      
      // User doesn't exist at all
      return res.status(404).json({
        message: 'No account found with this GitHub account. Please sign up first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // User exists - perform login
    user.lastLogin = new Date();
    // Update photo URL if it has changed
    if (photoURL && photoURL !== user.photoURL) {
      user.photoURL = photoURL;
    }
    await user.save();
    
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '7d'
    });
    
    console.log('GitHub user logged in:', user.email);
    
    res.status(200).json({
      message: 'GitHub login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        authProvider: user.authProvider,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    console.error('GitHub login error:', error);
    res.status(500).json({ 
      message: 'Internal server error during GitHub login' 
    });
  }
});
// Add this route in your server.cjs after the existing interview routes

app.get('/api/interviews/topic/:topic', async (req, res) => {
  try {
    console.log("=== TOPIC ROUTE HIT ===");
    const topicParam = decodeURIComponent(req.params.topic).trim();
    console.log("Searching for topic:", topicParam);
    console.log("Request URL:", req.url);

    // Check if Interview model exists
    if (!Interview) {
      console.error("Interview model not found!");
      return res.status(500).json({ error: "Interview model not defined" });
    }

    // Simple query first to test
    const interviews = await Interview.find({})
      .populate("user", "name")
      .lean()
      .exec();

    console.log(`Total interviews in DB: ${interviews.length}`);
    
    // Filter by topic on the server side for now
    const filteredInterviews = interviews.filter(interview => {
      const categoryMatch = interview.category && interview.category.toLowerCase().includes(topicParam.toLowerCase());
      const titleMatch = interview.title && interview.title.toLowerCase().includes(topicParam.toLowerCase());
      const tagMatch = interview.tags && interview.tags.some(tag => 
        tag.toLowerCase().includes(topicParam.toLowerCase())
      );
      return categoryMatch || titleMatch || tagMatch;
    });

    console.log(`Filtered interviews for "${topicParam}": ${filteredInterviews.length}`);
    console.log("Sample interview:", filteredInterviews[0] ? {
      title: filteredInterviews[0].title,
      category: filteredInterviews[0].category,
      tags: filteredInterviews[0].tags
    } : "None found");

    res.json(filteredInterviews);
    
  } catch (error) {
    console.error("=== ERROR in topic route ===");
    console.error("Error details:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      message: "Error fetching interviews", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// server.cjs - replace existing /api/profile/about handlers with this single, robust one
// server.cjs - single robust about handler
app.patch('/api/profile/about', authMiddleware, async (req, res) => {
  try {
    const aboutText = req.body?.aboutText ?? req.body?.about ?? req.body?.description;

    if (aboutText == null) {
      return res.status(400).json({ message: 'aboutText is required' });
    }

    const aboutString = String(aboutText);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { aboutText: aboutString } },
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'About section updated successfully',
      aboutText: updatedUser.aboutText,
      user: updatedUser
    });
  } catch (error) {
    console.error('PATCH /api/profile/about error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET follow status and count (public; uses Authorization if present)
app.get('/api/users/:id/follow-status', async (req, res) => {
  try {
    const targetParam = req.params.id;
    if (!targetParam) return res.status(400).json({ message: 'Missing id' });

    // Resolve target user by _id OR username
    let targetUser = null;
    if (mongoose.Types.ObjectId.isValid(targetParam)) {
      targetUser = await User.findById(targetParam).select('followers following').lean();
    }
    if (!targetUser) {
      targetUser = await User.findOne({ username: targetParam }).select('followers following').lean();
    }
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const followersCount = Array.isArray(targetUser.followers) ? targetUser.followers.length : 0;
    const followingCount = Array.isArray(targetUser.following) ? targetUser.following.length : 0;

    let isFollowing = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded && decoded.id) {
          isFollowing = (targetUser.followers || []).some(f => String(f) === String(decoded.id));
        }
      } catch (err) {
        // invalid token -> treat as unauthenticated
      }
    }

    return res.json({ isFollowing, followersCount, followingCount, targetId: targetUser._id });
  } catch (err) {
    console.error('Error in follow-status:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// --- SAFE follow route ---
app.post('/api/users/:id/follow', authMiddleware, async (req, res) => {
  try {
    const targetParam = req.params.id;
    const userId = req.user && req.user.id;

    if (!targetParam) return res.status(400).json({ message: 'Missing target id' });
    if (!userId) return res.status(401).json({ message: 'Not authenticated (req.user.id missing)' });

    // resolve target by id or username
    let target = null;
    if (mongoose.Types.ObjectId.isValid(targetParam)) {
      target = await User.findById(targetParam);
    }
    if (!target) {
      target = await User.findOne({ username: targetParam });
    }
    if (!target) return res.status(404).json({ message: 'Target user not found' });

    if (String(userId) === String(target._id)) return res.status(400).json({ message: "You can't follow yourself" });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId from token:', userId);
      return res.status(400).json({ message: 'Invalid authenticated user id' });
    }

    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    const targetObjectId = new mongoose.Types.ObjectId(String(target._id));

    // Perform the updates and return the updated docs (after update)
    const updatedTarget = await User.findByIdAndUpdate(
      targetObjectId,
      { $addToSet: { followers: userObjectId } },
      { new: true, runValidators: true }
    ).select('followers following').lean();

    const updatedCurrent = await User.findByIdAndUpdate(
      userObjectId,
      { $addToSet: { following: targetObjectId } },
      { new: true, runValidators: true }
    ).select('followers following').lean();

    if (!updatedTarget || !updatedCurrent) {
      console.error('Follow update did not return docs', { updatedTarget, updatedCurrent });
      return res.status(500).json({ message: 'Follow update failed' });
    }

    const followersCount = Array.isArray(updatedTarget.followers) ? updatedTarget.followers.length : 0;
    const followingCount = Array.isArray(updatedTarget.following) ? updatedTarget.following.length : 0;
    const yourFollowingCount = Array.isArray(updatedCurrent.following) ? updatedCurrent.following.length : 0;

    // persist stats numbers so snapshot fields remain consistent
    try {
      await User.findByIdAndUpdate(targetObjectId, {
        $set: {
          'stats.followers': followersCount,
          'stats.following': followingCount
        }
      }).exec();
      await User.findByIdAndUpdate(userObjectId, {
        $set: {
          'stats.following': yourFollowingCount
        }
      }).exec();
    } catch (errPersist) {
      console.error('Failed to persist stats counts after follow:', errPersist);
      // non-fatal: continue and return computed counts
    }

    // safe logging
    const followersSample = Array.isArray(updatedTarget.followers) ? updatedTarget.followers.slice(0, 10) : [];
    const followingSample = Array.isArray(updatedCurrent.following) ? updatedCurrent.following.slice(0, 10) : [];

    console.log(`User ${userId} followed ${String(target._id)}. followersCount=${followersCount}, yourFollowing=${yourFollowingCount}`);
    console.log('updatedTarget.followers sample:', followersSample);
    console.log('updatedCurrent.following sample:', followingSample);

    return res.json({
      message: 'Followed',
      isFollowing: true,
      followersCount,
      followingCount,
      yourFollowingCount,
      targetId: String(target._id)
    });
  } catch (err) {
    console.error('Error following user:', err.stack || err);
    return res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
});

// --- SAFE unfollow route ---
app.post('/api/users/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const targetParam = req.params.id;
    const userId = req.user && req.user.id;

    if (!targetParam) return res.status(400).json({ message: 'Missing target id' });
    if (!userId) return res.status(401).json({ message: 'Not authenticated (req.user.id missing)' });

    let target = null;
    if (mongoose.Types.ObjectId.isValid(targetParam)) target = await User.findById(targetParam);
    if (!target) target = await User.findOne({ username: targetParam });
    if (!target) return res.status(404).json({ message: 'Target user not found' });

    if (String(userId) === String(target._id)) return res.status(400).json({ message: "You can't unfollow yourself" });

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId from token:', userId);
      return res.status(400).json({ message: 'Invalid authenticated user id' });
    }

    const userObjectId = new mongoose.Types.ObjectId(String(userId));
    const targetObjectId = new mongoose.Types.ObjectId(String(target._id));

    const updatedTarget = await User.findByIdAndUpdate(
      targetObjectId,
      { $pull: { followers: userObjectId } },
      { new: true, runValidators: true }
    ).select('followers following').lean();

    const updatedCurrent = await User.findByIdAndUpdate(
      userObjectId,
      { $pull: { following: targetObjectId } },
      { new: true, runValidators: true }
    ).select('followers following').lean();

    if (!updatedTarget || !updatedCurrent) {
      console.error('Unfollow update did not return docs', { updatedTarget, updatedCurrent });
      return res.status(500).json({ message: 'Unfollow update failed' });
    }

    const followersCount = Array.isArray(updatedTarget.followers) ? updatedTarget.followers.length : 0;
    const followingCount = Array.isArray(updatedTarget.following) ? updatedTarget.following.length : 0;
    const yourFollowingCount = Array.isArray(updatedCurrent.following) ? updatedCurrent.following.length : 0;

    // persist stats numbers
    try {
      await User.findByIdAndUpdate(targetObjectId, {
        $set: {
          'stats.followers': followersCount,
          'stats.following': followingCount
        }
      }).exec();
      await User.findByIdAndUpdate(userObjectId, {
        $set: {
          'stats.following': yourFollowingCount
        }
      }).exec();
    } catch (errPersist) {
      console.error('Failed to persist stats counts after unfollow:', errPersist);
    }

    const followersSample = Array.isArray(updatedTarget.followers) ? updatedTarget.followers.slice(0, 10) : [];
    const followingSample = Array.isArray(updatedCurrent.following) ? updatedCurrent.following.slice(0, 10) : [];

    console.log(`User ${userId} unfollowed ${String(target._id)}. followersCount=${followersCount}, yourFollowing=${yourFollowingCount}`);
    console.log('updatedTarget.followers sample:', followersSample);
    console.log('updatedCurrent.following sample:', followingSample);

    return res.json({
      message: 'Unfollowed',
      isFollowing: false,
      followersCount,
      followingCount,
      yourFollowingCount,
      targetId: String(target._id)
    });
  } catch (err) {
    console.error('Error unfollowing user:', err.stack || err);
    return res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
});

// server.cjs (requires auth to prevent abuse)
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get('/api/cloudinary/sign', authMiddleware, (req, res) => {
  try {
    const timestamp = Math.round((Date.now() / 1000));
    const signature = cloudinary.utils.api_sign_request({ timestamp }, process.env.CLOUDINARY_API_SECRET);
    res.json({ signature, timestamp, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
  } catch (err) {
    console.error('Error signing Cloudinary request:', err);
    res.status(500).json({ message: 'Error signing request' });
  }
});

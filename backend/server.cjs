const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User.cjs');
const bcrypt = require('bcrypt'); // if not already at top
const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/interview-app';
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'askorishere'; 
const interviewRoutes = require("./interview.cjs"); // or your route file
const { connectToDb } = require('./db.cjs');

const aiRoutes = require("./ai.cjs");
app.use("/api/ai", aiRoutes);

console.log("Starting server...");

app.use(cors());
app.use(express.json());

// Use interview routes
app.use('/api/interviews', interviewRoutes);

connectToDb().then(() => {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Error connecting to MongoDB (Mongoose):', err.message);
    });
});

// ✅ Add a GET / route to respond to browser visits
app.get('/', (req, res) => {
  res.send('API is working');
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
  });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1]; // Expecting: Bearer <token>
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user data to request
    next(); // ✅ Proceed to actual route
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // ✅ Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: '1h'
    });

    res.status(200).json({ message: 'Login successful', token });
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

const Preference = require('./Preference.cjs');

// POST /api/preference - save form data (secured)
app.post('/api/preference', authMiddleware, async (req, res) => {
  const userId = req.user.id; // extracted from token
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

// GET /api/preference/check - see if user has already submitted preferences
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


app.get("/api/interviews/by-tag/:tag", (req, res) => {
  const tagParam = decodeURIComponent(req.params.tag).trim().toLowerCase();
  const results = interviews.filter(iv => 
    iv.tags?.some(t => t.trim().toLowerCase() === tagParam)
  );
  res.json(results);
});


app.post("/api/ai/feedback", async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a professional job interviewer. The candidate was asked: "${question}". Their answer was: "${answer}". Provide constructive feedback.`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      }),
    });

    const data = await response.json();
    const feedbackText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No feedback returned";
    res.json({ feedback: feedbackText });
  } catch (error) {
    console.error("AI proxy error:", error);
    res.status(500).json({ error: "AI service error" });
  }
});

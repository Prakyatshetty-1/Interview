// User.cjs
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SaveSchema = new mongoose.Schema({
  interviewId: { type: String, default: null },
  title: { type: String, required: true },
  imageUrl: { type: String },
  savedAt: { type: Date, default: Date.now },
});

const AttemptSchema = new mongoose.Schema({
  interviewId: { type: String, default: null },
  date: { type: Date, required: true },
  level: { type: Number, default: 1 }, // 0..4
  outcome: { type: String, default: "" },
  notes: { type: String, default: "" }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  username: { type: String, default: function() { return this.name; } },
  fullName: { type: String, default: function() { return this.name; } },
  company: { type: String, default: '' },
  education: { type: String, default: '' },
  aboutText: {
    type: String,
    default: "I'm a passionate developer looking to improve my interview skills and grow in my career."
  },
  interests: {
    type: [String],
    default: ['Web Development', 'Problem Solving', 'System Design']
  },
  profilePicture: { type: String, default: '' },

  // Stats and achievements
  stats: {
    totalInterviews: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalPracticeHours: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    mockInterviews: { type: Number, default: 0 },
    globalRank: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 }
  },

  // LeetCode specific stats
  leetcodeStats: {
    total: { type: Number, default: 3632 },
    attempting: { type: Number, default: 0 },
    easy: {
      solved: { type: Number, default: 0 },
      total: { type: Number, default: 886 }
    },
    medium: {
      solved: { type: Number, default: 0 },
      total: { type: Number, default: 1889 }
    },
    hard: {
      solved: { type: Number, default: 0 },
      total: { type: Number, default: 857 }
    },
    lastUpdated: { type: Date, default: Date.now }
  },

  technicalSkills: [{
    name: String,
    level: Number,
    color: String
  }],
  softSkills: [{
    name: String,
    level: Number
  }],

  favoriteTopics: {
    type: [String],
    default: ['System Design', 'Data Structures', 'Algorithms']
  },

  saves: { type: [SaveSchema], default: [] },
  attempts: { type: [AttemptSchema], default: [] }
}, {
  timestamps: true
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;

// User.cjs - Updated with LeetCode stats
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // Basic auth fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile fields
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
    total: { type: Number, default: 3632 }, // Total problems available on LeetCode
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
  
  // Skills
  technicalSkills: [{
    name: String,
    level: Number,
    color: String
  }],
  softSkills: [{
    name: String,
    level: Number
  }],
  
  // Preferences
  favoriteTopics: { 
    type: [String], 
    default: ['System Design', 'Data Structures', 'Algorithms'] 
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log('Hashing password:', this.password);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
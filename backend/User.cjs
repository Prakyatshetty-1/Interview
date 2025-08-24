// User.cjs - Updated with Google Authentication and LeetCode stats
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // Basic auth fields
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: function() {
      return !this.googleId; // Password required only if not Google user
    }
  },
  
  // 🆕 Google Authentication fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  photoURL: {
    type: String,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  
  // Profile fields
  username: { 
    type: String, 
    unique: true,
    sparse: true, // Allows null values but ensures uniqueness when present
    trim: true,
    default: function() { return this.name; } 
  },
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
  profilePicture: { 
    type: String, 
    default: function() {
      // Use Google photo if available, otherwise empty string
      return this.photoURL || '';
    }
  },
  
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
  },
  
  // 🆕 Additional tracking fields
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// 🆕 Modified pre-save middleware to handle Google users (no password)
userSchema.pre('save', async function (next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// 🆕 Method to compare passwords (handles Google users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    // Google users don't have passwords
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// 🆕 Method to check if user is Google user
userSchema.methods.isGoogleUser = function() {
  return this.authProvider === 'google' && this.googleId;
};

// 🆕 Method to get user public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    fullName: this.fullName,
    company: this.company,
    education: this.education,
    aboutText: this.aboutText,
    interests: this.interests,
    photoURL: this.photoURL || this.profilePicture,
    stats: this.stats,
    leetcodeStats: this.leetcodeStats,
    technicalSkills: this.technicalSkills,
    softSkills: this.softSkills,
    favoriteTopics: this.favoriteTopics,
    createdAt: this.createdAt,
    authProvider: this.authProvider
  };
};

// 🆕 Method to get display photo (prioritizes Google photo)
userSchema.methods.getDisplayPhoto = function() {
  return this.photoURL || this.profilePicture || '';
};

// 🆕 Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// 🆕 Static method to find user by Google ID or email
userSchema.statics.findByGoogleIdOrEmail = function(googleId, email) {
  return this.findOne({
    $or: [
      { googleId: googleId },
      { email: email.toLowerCase() }
    ]
  });
};

// 🆕 Virtual for total problems solved
userSchema.virtual('totalProblemsSolved').get(function() {
  return this.leetcodeStats.easy.solved + 
         this.leetcodeStats.medium.solved + 
         this.leetcodeStats.hard.solved;
});

// 🆕 Virtual for LeetCode progress percentage
userSchema.virtual('leetcodeProgress').get(function() {
  const totalSolved = this.totalProblemsSolved;
  return Math.round((totalSolved / this.leetcodeStats.total) * 100);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
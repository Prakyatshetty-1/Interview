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
      return !this.googleId && !this.githubId; // Password required only if not OAuth user
    }
  },
  
  // OAuth Authentication fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  githubId: {
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
    enum: ['local', 'google', 'github'],
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
      // Use OAuth photo if available, otherwise empty string
      return this.photoURL || '';
    }
  },

  // *** NEW: persistent follower/following arrays (store relations) ***
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  
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
    followers: { type: Number, default: 0 }, // numeric snapshot
    following: { type: Number, default: 0 }  // numeric snapshot
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

  
  // Preferences
  favoriteTopics: { 
    type: [String], 
    default: ['System Design', 'Data Structures', 'Algorithms'] 
  },
  saves: { type: [SaveSchema], default: [] },
  attempts: { type: [AttemptSchema], default: [] },

  // NEW: Track completed interview packs to prevent duplicate LeetCode updates
  completedPacks: [{
    packId: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'],
      required: true 
    },
    completedAt: { type: Date, default: Date.now },
    questionsCompleted: { type: Number, default: 1 }
  }],

  // Additional tracking fields
  lastLogin: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
});

// NEW: Index for efficient completion lookups
userSchema.index({ 'completedPacks.packId': 1, '_id': 1 });

// Modified pre-save middleware to handle OAuth users (no password)
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

// Method to compare passwords (handles OAuth users)
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    // OAuth users don't have passwords
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is OAuth user
userSchema.methods.isGoogleUser = function() {
  return this.authProvider === 'google' && this.googleId;
};

userSchema.methods.isGitHubUser = function() {
  return this.authProvider === 'github' && this.githubId;
};

userSchema.methods.isOAuthUser = function() {
  return this.isGoogleUser() || this.isGitHubUser();
};

// NEW: Instance method to check if pack is completed
userSchema.methods.hasCompletedPack = function(packId) {
  if (!this.completedPacks || !Array.isArray(this.completedPacks)) {
    return false;
  }
  return this.completedPacks.some(pack => String(pack.packId) === String(packId));
};

// NEW: Instance method to add completed pack
userSchema.methods.addCompletedPack = function(packId, difficulty, questionsCompleted = 1) {
  if (!this.completedPacks) {
    this.completedPacks = [];
  }
  
  // Don't add if already completed
  if (this.hasCompletedPack(packId)) {
    return false;
  }
  
  this.completedPacks.push({
    packId: packId,
    difficulty: difficulty.toLowerCase(),
    completedAt: new Date(),
    questionsCompleted: questionsCompleted
  });
  
  return true;
};

// Method to get user public profile (without sensitive data)
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

// Method to get display photo (prioritizes OAuth photo)
userSchema.methods.getDisplayPhoto = function() {
  return this.photoURL || this.profilePicture || '';
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find user by OAuth ID or email
userSchema.statics.findByGoogleIdOrEmail = function(googleId, email) {
  return this.findOne({
    $or: [
      { googleId: googleId },
      { email: email.toLowerCase() }
    ]
  });
};

userSchema.statics.findByGitHubIdOrEmail = function(githubId, email) {
  return this.findOne({
    $or: [
      { githubId: githubId },
      { email: email.toLowerCase() }
    ]
  });
};

// NEW: Static method to find users who completed a specific pack
userSchema.statics.findUsersWhoCompleted = function(packId) {
  return this.find({
    'completedPacks.packId': String(packId)
  }).select('name email completedPacks.$');
};

// Virtual for total problems solved
userSchema.virtual('totalProblemsSolved').get(function() {
  return this.leetcodeStats.easy.solved + 
         this.leetcodeStats.medium.solved + 
         this.leetcodeStats.hard.solved;
});

// Virtual for LeetCode progress percentage
userSchema.virtual('leetcodeProgress').get(function() {
  const totalSolved = this.totalProblemsSolved;
  return Math.round((totalSolved / this.leetcodeStats.total) * 100);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
require('dotenv').config();
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

// fallback to local DB if env var not provided
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-app';

// create client after uri defined
const client = new MongoClient(uri, {
  // optional: keep defaults, set options if you need them
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let db;

async function connectToDb() {
  try {
    // connect native driver
    await client.connect();
    db = client.db('interview-app');
    console.log('Connected to MongoDB using native driver');

    // connect mongoose
    // if already connected, skip
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB using Mongoose');
    } else {
      console.log('Mongoose already connected (readyState):', mongoose.connection.readyState);
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }
  return db;
}

// -------------------- Schemas / Models --------------------
const questionSchema = new mongoose.Schema({
  question: String,
  category: { type: String, default: 'General' },
  difficulty: { type: String, default: 'Medium' },
  expectedDuration: { type: Number, default: 5 },
  tag: { type: String }
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      default: 'Untitled Interview'
    },
    questions: [questionSchema],
    category: String,
    difficulty: String,
    duration: Number,
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

// in case file is hot-reloaded or required multiple times
const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);

// exports
module.exports = { connectToDb, getDb, Interview, mongoose };
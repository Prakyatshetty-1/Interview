// backend/db.cjs
require("dotenv").config();
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

const uri =process.env.MONGO_URI; // Use full DB name here
const client = new MongoClient(uri);

let db;

async function connectToDb() {
  try {
    await client.connect();
    db = client.db("interview-app");
    console.log("Connected to MongoDB using native driver");

    // ✅ Connect mongoose as well
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB using Mongoose");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDb first.");
  }
  return db;
}

// Schemas
// Schemas
const questionSchema = new mongoose.Schema({
  question: String,
  category: { type: String, default: "General" },
  difficulty: { type: String, default: "Medium" },
  expectedDuration: { type: Number, default: 5 },
  tag: { type: String } // optional per-question tag (if you want it)
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Untitled Interview",
    },
    questions: [questionSchema],
    category: String,
    difficulty: String,
    duration: Number,
    tags: { type: [String], default: [] } // <-- store tags as an array
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = { connectToDb, getDb, Interview };

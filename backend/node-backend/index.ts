// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const crypto = require("crypto");
// require("dotenv").config();
// import ex
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/quiz-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Schema Definitions
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: Number, required: true },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  timeLimit: { type: Number, required: true, default: 30 },
  questions: [QuestionSchema],
  accessCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

// Generate access code before saving
QuizSchema.pre("save", function (next) {
  if (!this.accessCode) {
    this.accessCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  }
  next();
});

const SubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  studentName: { type: String, required: true },
  answers: { type: Map, of: Number },
  score: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
});

// Models
const Quiz = mongoose.model("Quiz", QuizSchema);
const Submission = mongoose.model("Submission", SubmissionSchema);

// Routes

// Create a quiz
app.post("/api/quizzes", async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a quiz by access code (for students)
app.get("/api/quizzes/:accessCode", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ accessCode: req.params.accessCode });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    // Don't send correct answers to students
    const sanitizedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        // correctAnswer is omitted
      })),
      createdAt: quiz.createdAt,
    };

    res.status(200).json({
      success: true,
      data: sanitizedQuiz,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create a submission
app.post("/api/submissions", async (req, res) => {
  try {
    const { quizId, studentName, answers, score, timeSpent, completed } =
      req.body;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    const submission = await Submission.create({
      quizId,
      studentName,
      answers,
      score,
      timeSpent,
      completed,
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a quiz with full details (for teachers)
app.get("/api/teacher/quizzes/:accessCode", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ accessCode: req.params.accessCode });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    // Get submissions for this quiz
    const submissions = await Submission.find({ quizId: quiz._id });

    res.status(200).json({
      success: true,
      data: {
        quiz,
        submissionCount: submissions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get submissions for a quiz
app.get("/api/quizzes/:quizId/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find({ quizId: req.params.quizId });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

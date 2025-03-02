import express, { Request, Response, RequestHandler } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
// Configure dotenv
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialize Express app
const app = express();

// CORS Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies if needed
  })
);

// Middleware
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/quiz-app")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Define Schema for Question and Quiz (simplified)
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

// MongoDB Models
const Quiz = mongoose.model("Quiz", QuizSchema);

// Interface for the access code parameter
interface AccessCodeParams {
  accessCode: string;
}

// Define the route handler for getting a quiz by access code
const getQuizByAccessCode = async (req: any, res: any) => {
  try {
    const quiz = await Quiz.findOne({ accessCode: req.params.accessCode });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    // Sanitizing the response (removing sensitive data like the correct answer)
    const sanitizedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
      })),
      createdAt: quiz.createdAt,
    };

    res.status(200).json({
      success: true,
      data: sanitizedQuiz,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

// Route for getting a quiz by access code
app.get("/api/quizzes/:accessCode", getQuizByAccessCode);

const generateAccessCode = (length = 6) => {
  // Use only uppercase letters and numbers, excluding similar-looking characters
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};
// Route for creating a quiz with an access code
app.post("/api/quizzes", async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate a unique access code
    const accessCode = generateAccessCode();

    // Create quiz with the access code
    const quizData = {
      ...req.body,
      accessCode,
    };

    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}/api/test`);
});

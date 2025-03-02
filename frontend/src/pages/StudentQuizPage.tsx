import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import QuizAnalysis from "@/components/custom/QuizAnalysis"; // Ensure this path is correct
import { AnalysisProps } from "@/utils/types"; // Ensure this path is correct

// API URL - adjust to match your backend
const API_URL = "http://localhost:5000/api";

// Timer component to show remaining time
const QuizTimer = ({ initialMinutes, onTimeUp }) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }

        // Set warning when less than 5 minutes remaining
        if (prevSeconds === 300) {
          setIsWarning(true);
        }

        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp]);

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`fixed top-24 right-6 py-2 px-4 rounded-full flex items-center space-x-2 z-10 ${
        isWarning
          ? "bg-red-50 text-red-600 animate-pulse"
          : "bg-purple-50 text-purple-600"
      }`}
    >
      <Clock className="h-5 w-5" />
      <span className="font-bold">{formatTime()}</span>
    </div>
  );
};

// Score Modal Component
const ScoreModal = ({ isOpen, onClose, score, total, wrongAnswers }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 relative my-8 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
            {score === total ? (
              <CheckCircle2 className="h-10 w-10 text-purple-600" />
            ) : (
              <Brain className="h-10 w-10 text-purple-600" />
            )}
          </div>
          <h3 className="text-3xl font-bold mb-3">Your Score</h3>
          <p className="text-5xl font-bold text-purple-600 mb-2">
            {score} / {total}
          </p>
          <p className="text-lg text-gray-600">
            {Math.round((score / total) * 100)}% Correct
          </p>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4">
              Review Incorrect Answers:
            </h4>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 hidden-scrollbar">
              {wrongAnswers.map((wrong, index) => (
                <div
                  key={index}
                  className="bg-red-50 p-6 rounded-xl border border-red-100"
                >
                  <p className="font-medium text-gray-800 mb-3">
                    {wrong.question}
                  </p>
                  <p className="text-red-600 mb-2 flex items-center">
                    <XCircle className="h-5 w-5 mr-2" />
                    Your answer: {wrong.userAnswer}
                  </p>
                  <p className="text-green-600 flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Correct answer: {wrong.correctAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function StudentQuizPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({});

  const hasSubmitted = useRef(false);
  const [analysis, setAnalysis] = useState<AnalysisProps[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Load quiz data from URL query param or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      setAccessCode(code);
      fetchQuiz(code);
    } else {
      setIsLoading(false);
    }

    // Check if quiz was in progress (handle page refresh)
    const savedQuiz = localStorage.getItem("currentQuiz");
    const savedAnswers = localStorage.getItem("quizAnswers");
    const savedName = localStorage.getItem("studentName");

    if (savedQuiz) {
      try {
        const parsed = JSON.parse(savedQuiz);
        setQuizData(parsed);
        setQuizStarted(true);

        if (savedAnswers) {
          setUserAnswers(JSON.parse(savedAnswers));
        }

        if (savedName) {
          setStudentName(savedName);
        }
      } catch (err) {
        console.error("Error restoring quiz state:", err);
        localStorage.removeItem("currentQuiz");
        localStorage.removeItem("quizAnswers");
      }
    }
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (quizStarted && Object.keys(userAnswers).length > 0) {
      localStorage.setItem("quizAnswers", JSON.stringify(userAnswers));
    }
  }, [userAnswers, quizStarted]);

  const fetchQuiz = async (code) => {
    setIsLoading(true);
    setError("");

    try {
      console.log(`Fetching quiz with code: ${code}`);
      const response = await axios.get(`${API_URL}/quizzes/${code}`);
      console.log("Quiz data received:", response.data);

      if (response.data.success) {
        setQuizData(response.data.data);
        localStorage.setItem("currentQuiz", JSON.stringify(response.data.data));
      } else {
        setError("Could not load quiz. Please check the access code.");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setError("Quiz not found. Please check the access code and try again.");
    }

    setIsLoading(false);
  };

  const handleStartQuiz = () => {
    if (!studentName.trim()) {
      setError("Please enter your name to start the quiz");
      return;
    }

    setQuizStarted(true);
    localStorage.setItem("studentName", studentName);
  };

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError("Please enter an access code");
      return;
    }

    fetchQuiz(accessCode);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (showResults || timeExpired) return; // Prevent changing answers after submission or time expiry

    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const fetchCorrectAnswers = async (quizId) => {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${quizId}/answers`);
      if (response.data.success) {
        const answers = {};
        response.data.data.forEach((item) => {
          answers[item.questionIndex] = item.correctAnswer;
        });
        return answers;
      }
    } catch (error) {
      console.error("Error fetching correct answers:", error);
    }

    // Default fallback if API call fails
    const fallback = {};
    if (quizData) {
      quizData.questions.forEach((_, index) => {
        fallback[index] = 0; // First option as fallback
      });
    }
    return fallback;
  };

  const handleSubmitQuiz = async () => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    setIsSubmitting(true);

    try {
      // Fetch correct answers
      const answers = await fetchCorrectAnswers(quizData._id);
      setCorrectAnswers(answers);

      // Calculate score
      let score = 0;
      Object.keys(userAnswers).forEach((index) => {
        if (answers[index] === userAnswers[index]) {
          score++;
        }
      });

      // Convert answers object to Map format expected by backend
      const answersMap = {};
      Object.keys(userAnswers).forEach((key) => {
        answersMap[key] = userAnswers[key];
      });

      // Submit to backend
      const response = await axios.post(`${API_URL}/submissions`, {
        quizId: quizData._id,
        studentName,
        answers: answersMap,
        score,
        timeSpent: quizData.timeLimit * 60 - (timeExpired ? 0 : 1), // If time expired, count full time
        completed:
          Object.keys(userAnswers).length === quizData.questions.length,
      });

      setSubmissionId(response.data.data._id);
      setShowResults(true);
      setIsModalOpen(true);

      // Clear localStorage
      localStorage.removeItem("currentQuiz");
      localStorage.removeItem("quizAnswers");

      await handleFeedback(); // Call handleFeedback after submitting the quiz
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to submit quiz. Please try again.");
      hasSubmitted.current = false;
    }

    setIsSubmitting(false);
  };

  const handleTimeUp = () => {
    setTimeExpired(true);

    if (!hasSubmitted.current) {
      handleSubmitQuiz();
    }
  };

  const calculateScore = () => {
    if (!quizData || Object.keys(correctAnswers).length === 0) return 0;

    let correct = 0;
    Object.keys(userAnswers).forEach((index) => {
      if (userAnswers[index] === correctAnswers[index]) {
        correct++;
      }
    });

    return correct;
  };

  const getWrongAnswers = () => {
    if (!quizData || Object.keys(correctAnswers).length === 0) return [];

    return quizData.questions
      .map((mcq, index) => {
        if (userAnswers[index] !== correctAnswers[index]) {
          return {
            question: mcq.question,
            userAnswer: mcq.options[userAnswers[index]] || "No answer selected",
            correctAnswer: mcq.options[correctAnswers[index]],
          };
        }
        return null;
      })
      .filter((item) => item !== null);
  };

  const handleFeedback = async () => {
    setIsLoadingAnalysis(true);
    try {
      const wrongAnswersForAnalysis = getWrongAnswers().map((wrong) => ({
        question: wrong.question,
        user_answer: wrong.userAnswer,
        correct_answer: wrong.correctAnswer,
      }));

      const response = await axios.post(
        "https://genmodel.onrender.com/analyze",
        wrongAnswersForAnalysis
      );
      setAnalysis(response.data);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error getting analysis:", error);
      alert("Failed to get detailed analysis. Please try again.");
    }
    setIsLoadingAnalysis(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {timeExpired && !showResults && (
            <div className="bg-red-50 p-4 rounded-xl mb-6 flex items-center justify-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Time's up! Your answers have been submitted automatically.
            </div>
          )}

          {!quizStarted ? (
            <div className="flex items-center justify-center flex-col">
              <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 p-8 max-w-md w-full">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
                    <Brain className="h-10 w-10 text-purple-600" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3">
                    Student Quiz Portal
                  </h1>
                  <p className="text-gray-600">
                    Enter your access code to start a quiz
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                  </div>
                )}

                {!quizData ? (
                  <form onSubmit={handleAccessCodeSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiz Access Code
                      </label>
                      <input
                        type="text"
                        value={accessCode}
                        onChange={(e) =>
                          setAccessCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter access code"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-base"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium flex items-center justify-center disabled:opacity-50 hover:from-purple-700 hover:to-blue-700 transition-colors"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        "Find Quiz"
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h2 className="text-xl font-semibold mb-2">
                        {quizData.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-2">
                        {quizData.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{quizData.timeLimit} minutes</span>
                        <span className="mx-2">•</span>
                        <span>{quizData.questions.length} questions</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-base"
                      />
                    </div>

                    <button
                      onClick={handleStartQuiz}
                      disabled={!studentName.trim()}
                      className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium flex items-center justify-center disabled:opacity-50 hover:from-purple-700 hover:to-blue-700 transition-colors"
                    >
                      Start Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {quizData && (
                <QuizTimer
                  initialMinutes={quizData.timeLimit}
                  onTimeUp={handleTimeUp}
                />
              )}

              <div className="flex items-center justify-between mb-10">
                <div>
                  <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {quizData?.title || "Quiz"}
                  </h1>
                  <p className="text-gray-600">
                    Complete all questions before submitting
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-4 rounded-2xl">
                  <Brain className="h-10 w-10 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 p-8">
                <div className="space-y-10">
                  {quizData?.questions.map((mcq, index) => (
                    <div key={index} className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <span className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-600 px-4 py-2 rounded-xl text-base font-medium">
                          Q{index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-lg font-medium mb-6">
                            {mcq.question}
                          </p>
                          <div className="space-y-4">
                            {mcq.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                onClick={() =>
                                  handleAnswerSelect(index, optIndex)
                                }
                                className={`
                                  flex items-center space-x-4 p-4 rounded-xl cursor-pointer
                                  transition-all duration-200
                                  ${
                                    userAnswers[index] === optIndex
                                      ? "bg-purple-50 border-2 border-purple-500"
                                      : "hover:bg-gray-50 border-2 border-transparent"
                                  }
                                  ${
                                    showResults || timeExpired
                                      ? "cursor-default"
                                      : "cursor-pointer"
                                  }
                                `}
                              >
                                <div
                                  className={`
                                  w-7 h-7 rounded-full flex items-center justify-center
                                  border-2 transition-colors duration-200
                                  ${
                                    userAnswers[index] === optIndex
                                      ? "border-purple-500 bg-purple-500"
                                      : "border-gray-300"
                                  }
                                `}
                                >
                                  {userAnswers[index] === optIndex && (
                                    <Check className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <span
                                  className={`text-base ${
                                    showResults
                                      ? optIndex === correctAnswers[index]
                                        ? "text-green-600 font-medium"
                                        : userAnswers[index] === optIndex
                                        ? "text-red-600"
                                        : "text-gray-600"
                                      : userAnswers[index] === optIndex
                                      ? "text-purple-700 font-medium"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {option}
                                  {showResults &&
                                    optIndex === correctAnswers[index] && (
                                      <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-600" />
                                    )}
                                  {showResults &&
                                    userAnswers[index] === optIndex &&
                                    optIndex !== correctAnswers[index] && (
                                      <XCircle className="inline-block ml-2 h-5 w-5 text-red-600" />
                                    )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-8 border-t">
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={
                        Object.keys(userAnswers).length !==
                          quizData?.questions.length ||
                        showResults ||
                        isSubmitting ||
                        timeExpired
                      }
                      className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-purple-700 hover:to-blue-700 transition-colors text-lg flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : showResults ? (
                        "Quiz Submitted"
                      ) : (
                        "Submit Quiz"
                      )}
                    </button>

                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl"
                      >
                        <p className="text-center text-xl font-medium">
                          Your Score: {calculateScore()} out of{" "}
                          {quizData?.questions.length} (
                          {Math.round(
                            (calculateScore() / quizData?.questions.length) *
                              100
                          )}
                          %)
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              {showAnalysis && (
                <QuizAnalysis
                  analysis={analysis}
                  isLoading={isLoadingAnalysis}
                />
              )}
            </>
          )}
        </motion.div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <ScoreModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            score={calculateScore()}
            total={quizData?.questions.length}
            wrongAnswers={getWrongAnswers()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Loader2,
  RefreshCw,
  Download,
  Pencil,
  X,
  CheckCircle2,
  Check,
  Send,
} from "lucide-react";
import axios from "axios";
import Navbar from "@/components/Navbar";

export default function TeacherQuizPage() {
  const [description, setDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMCQs, setGeneratedMCQs] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [activeTab, setActiveTab] = useState("preview");
  const [quizTitle, setQuizTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(30); // Minutes
  const [isSending, setIsSending] = useState(false);
  const [quizAccessCode, setQuizAccessCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // API URL - make sure this matches your actual backend URL
  const API_URL = import.meta.env.VITE_NODE_BACKEND;

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await axios.post(
        "https://genmodel.onrender.com/generate",
        {
          prompt: description + `Give me ${numQuestions} only`,
        }
      );

      const mcqs = response.data.map((item, index) => ({
        question: item.Question,
        options: item.Options,
        correctAnswer: item.Options.indexOf(item.Answer),
        explanation: "",
      }));
      setGeneratedMCQs(mcqs);
    } catch (error) {
      console.error("Error generating MCQs:", error);
      alert(
        "Something went wrong while generating the MCQs. Please try again."
      );
    }

    setIsGenerating(false);
  };

  const handleRegenerate = () => {
    setGeneratedMCQs([]);
    handleGenerate();
  };

  const handleExport = () => {
    const fileName = "generated_mcqs.json";
    const jsonContent = JSON.stringify(generatedMCQs, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditForm({ ...generatedMCQs[index] });
  };

  const handleEditChange = (field, value, optionIndex) => {
    if (!editForm) return;

    if (field === "options" && typeof optionIndex === "number") {
      const newOptions = [...editForm.options];
      newOptions[optionIndex] = value;
      setEditForm({ ...editForm, options: newOptions });
    } else {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const saveEdit = () => {
    if (editingIndex === null || !editForm) return;

    const newMCQs = [...generatedMCQs];
    newMCQs[editingIndex] = editForm;
    setGeneratedMCQs(newMCQs);
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSendQuiz = async () => {
    if (!quizTitle || !timeLimit || generatedMCQs.length === 0) {
      alert("Please provide a quiz title, time limit, and generate questions");
      return;
    }

    setIsSending(true);

    try {
      console.log("Sending quiz to:", `${API_URL}/quizzes`);

      // Send to backend API
      const quizData = {
        title: quizTitle,
        description: description,
        timeLimit: parseInt(timeLimit),
        questions: generatedMCQs,
      };

      console.log("Quiz data:", quizData);

      const response = await axios.post(`${API_URL}/quizzes`, quizData);
      console.log("Response:", response.data);

      // Get access code from the response
      const { accessCode } = response.data.data;
      setQuizAccessCode(accessCode);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error sending quiz:", error);
      alert(`Failed to send quiz: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setQuizTitle("");
    setTimeLimit(30);
    setDescription("");
    setGeneratedMCQs([]);
    setQuizAccessCode("");
    setShowSuccess(false);
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
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Teacher Quiz Creator
              </h1>
              <p className="text-gray-600 text-lg">
                Create quizzes with AI and send them to your students
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-4 rounded-2xl">
              <Brain className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          {/* Quiz Settings Section */}
          <div className="grid gap-8">
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 p-8">
              <h2 className="text-2xl font-semibold mb-6">Quiz Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter quiz title..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-base"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-3">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Description Section */}
            <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Content Description
                  </label>
                  <textarea
                    placeholder="Enter the text content or topic description..."
                    className="w-full h-40 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white hidden-scrollbar text-base"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!description || isGenerating}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium flex items-center justify-center disabled:opacity-50 hover:from-purple-700 hover:to-blue-700 transition-colors text-lg"
                >
                  {isGenerating ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Brain className="h-5 w-5 mr-2" />
                  )}
                  Generate MCQs
                </button>
              </div>
            </div>

            {/* Generated MCQs */}
            {generatedMCQs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-white rounded-2xl shadow-lg shadow-purple-100/50 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold">
                      Generated Questions
                    </h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleRegenerate}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-base font-medium flex items-center hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Regenerate
                      </button>
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-base font-medium flex items-center hover:bg-gray-50 transition-colors"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 mb-8">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-6 py-3 rounded-xl text-base font-medium transition-colors ${
                        activeTab === "preview"
                          ? "bg-purple-100 text-purple-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-6 py-3 rounded-xl text-base font-medium transition-colors ${
                        activeTab === "edit"
                          ? "bg-purple-100 text-purple-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Edit
                    </button>
                  </div>

                  {activeTab === "preview" ? (
                    <div className="space-y-10">
                      {generatedMCQs.map((mcq, index) => (
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
                                    className={`
                                      flex items-center space-x-4 p-4 rounded-xl
                                      transition-all duration-200
                                      ${
                                        optIndex === mcq.correctAnswer
                                          ? "bg-green-50 border-2 border-green-500"
                                          : "hover:bg-gray-50 border-2 border-transparent"
                                      }
                                    `}
                                  >
                                    <div
                                      className={`
                                      w-7 h-7 rounded-full flex items-center justify-center
                                      border-2 transition-colors duration-200
                                      ${
                                        optIndex === mcq.correctAnswer
                                          ? "border-green-500 bg-green-500"
                                          : "border-gray-300"
                                      }
                                    `}
                                    >
                                      {optIndex === mcq.correctAnswer && (
                                        <Check className="h-4 w-4 text-white" />
                                      )}
                                    </div>
                                    <span
                                      className={`text-base ${
                                        optIndex === mcq.correctAnswer
                                          ? "text-green-700 font-medium"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {option}
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
                          onClick={handleSendQuiz}
                          disabled={
                            !quizTitle ||
                            !timeLimit ||
                            generatedMCQs.length === 0 ||
                            isSending
                          }
                          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-purple-700 hover:to-blue-700 transition-colors text-lg flex items-center justify-center"
                        >
                          {isSending ? (
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5 mr-2" />
                          )}
                          Send Quiz
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {generatedMCQs.map((mcq, index) => (
                        <div
                          key={index}
                          className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100"
                        >
                          <div className="flex items-start justify-between">
                            <span className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-600 px-4 py-2 rounded-xl text-base font-medium">
                              Q{index + 1}
                            </span>
                            <button
                              onClick={() => startEditing(index)}
                              className="text-gray-400 hover:text-purple-600 transition-colors"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                          </div>
                          {editingIndex === index ? (
                            <div className="space-y-4">
                              <textarea
                                value={editForm?.question}
                                onChange={(e) =>
                                  handleEditChange("question", e.target.value)
                                }
                                className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter question"
                              />
                              {editForm?.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex space-x-3">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                      handleEditChange(
                                        "options",
                                        e.target.value,
                                        optIndex
                                      )
                                    }
                                    className="flex-1 p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                  <div
                                    onClick={() =>
                                      handleEditChange(
                                        "correctAnswer",
                                        optIndex
                                      )
                                    }
                                    className={`
                                      w-7 h-7 rounded-full flex items-center justify-center cursor-pointer
                                      border-2 transition-colors duration-200 mt-4
                                      ${
                                        editForm.correctAnswer === optIndex
                                          ? "border-purple-500 bg-purple-500"
                                          : "border-gray-300"
                                      }
                                    `}
                                  >
                                    {editForm.correctAnswer === optIndex && (
                                      <Check className="h-4 w-4 text-white" />
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => {
                                    setEditingIndex(null);
                                    setEditForm(null);
                                  }}
                                  className="px-4 py-2 border border-gray-200 rounded-xl text-base"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveEdit}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-base hover:bg-purple-700 transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-lg font-medium">
                                {mcq.question}
                              </p>
                              <div className="space-y-3">
                                {mcq.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className="flex items-center space-x-3"
                                  >
                                    <span className="w-7 h-7 flex items-center justify-center border-2 border-gray-300 rounded-full text-base">
                                      {optIndex === mcq.correctAnswer
                                        ? "✓"
                                        : String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span className="text-base">{option}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
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
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-xl"
            >
              <button
                onClick={() => setShowSuccess(false)}
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Quiz Sent Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your quiz has been created and is ready to share with
                  students.
                </p>

                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <p className="text-sm text-gray-500 mb-2">Access Code</p>
                  <p className="text-2xl font-bold tracking-wide text-purple-600 font-mono">
                    {quizAccessCode}
                  </p>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Share this code with your students so they can access the
                  quiz.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Create New Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

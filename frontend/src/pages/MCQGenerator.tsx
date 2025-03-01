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
  XCircle,
  Check,
  Youtube,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import { AnalysisProps, MCQProps, ScoreModalProps } from "@/utils/types";
import QuizAnalysis from "@/components/custom/QuizAnalysis";

const ScoreModal = ({
  isOpen,
  onClose,
  score,
  total,
  wrongAnswers,
}: ScoreModalProps) => {
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

export default function MCQGenerator() {
  const [description, setDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMCQs, setGeneratedMCQs] = useState<MCQProps[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<MCQProps | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [analysis, setAnalysis] = useState<AnalysisProps[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowResults(false);
    setUserAnswers({});
    setAnalysis([]);
    setShowAnalysis(false);

    try {
      const response = await axios.post(
        "https://genmodel.onrender.com/generate",
        {
          prompt: description + `Give me ${numQuestions} only`,
        }
      );

      const mcqs = response.data.map((item: any, index: number) => ({
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
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (showResults) return; // Prevent changing answers after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    handleFeedback();
  };

  const handleFeedback = async () => {
    setIsLoadingAnalysis(true);
    try {
      const wrongAnswersForAnalysis = wrongAnswers.map((wrong) => ({
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

  const calculateScore = () => {
    let correct = 0;
    generatedMCQs.forEach((_, index) => {
      if (userAnswers[index] === generatedMCQs[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
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

  const handleRegenerate = () => {
    setGeneratedMCQs([]);
    setUserAnswers({});
    setShowResults(false);
    setAnalysis([]);
    setShowAnalysis(false);
    handleGenerate();
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...generatedMCQs[index] });
  };

  const handleEditChange = (
    field: keyof MCQ,
    value: string | string[],
    optionIndex?: number
  ) => {
    if (!editForm) return;

    if (field === "options" && typeof optionIndex === "number") {
      const newOptions = [...editForm.options];
      newOptions[optionIndex] = value as string;
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

  const wrongAnswers = generatedMCQs
    .map((mcq, index) => {
      if (userAnswers[index] !== mcq.correctAnswer) {
        return {
          question: mcq.question,
          userAnswer: mcq.options[userAnswers[index]],
          correctAnswer: mcq.options[mcq.correctAnswer],
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

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
                AI MCQ Generator
              </h1>
              <p className="text-gray-600 text-lg">
                Transform any text into multiple-choice questions
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-4 rounded-2xl">
              <Brain className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="grid gap-8">
            {/* Input Section */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        showResults
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
                                          ? optIndex === mcq.correctAnswer
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
                                        optIndex === mcq.correctAnswer && (
                                          <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-600" />
                                        )}
                                      {showResults &&
                                        userAnswers[index] === optIndex &&
                                        optIndex !== mcq.correctAnswer && (
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
                          onClick={handleSubmit}
                          disabled={
                            Object.keys(userAnswers).length !==
                              generatedMCQs.length || showResults
                          }
                          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-purple-700 hover:to-blue-700 transition-colors text-lg"
                        >
                          {showResults ? "Answers Submitted" : "Submit Answers"}
                        </button>

                        {showResults && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl"
                          >
                            <p className="text-center text-xl font-medium">
                              Your Score: {calculateScore()} out of{" "}
                              {generatedMCQs.length} (
                              {Math.round(
                                (calculateScore() / generatedMCQs.length) * 100
                              )}
                              %)
                            </p>
                          </motion.div>
                        )}

                        {showResults && wrongAnswers.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 space-y-6"
                          >
                            <div className="border-t pt-8">
                              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                                <AlertCircle className="h-6 w-6 mr-2 text-purple-600" />
                                Review Incorrect Answers
                              </h3>
                              <div className="space-y-6">
                                {wrongAnswers.map((wrong, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                                  >
                                    <p className="text-lg font-medium mb-4">
                                      {wrong.question}
                                    </p>
                                    <div className="space-y-3">
                                      <div className="flex items-start space-x-3 text-red-600">
                                        <XCircle className="h-5 w-5 mt-0.5" />
                                        <div>
                                          <p className="font-medium">
                                            Your Answer:
                                          </p>
                                          <p>{wrong.userAnswer}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start space-x-3 text-green-600">
                                        <CheckCircle2 className="h-5 w-5 mt-0.5" />
                                        <div>
                                          <p className="font-medium">
                                            Correct Answer:
                                          </p>
                                          <p>{wrong.correctAnswer}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {showAnalysis && (
                              <QuizAnalysis analysis={analysis} />
                            )}

                            {isLoadingAnalysis && (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                                <span className="ml-3 text-lg text-gray-600">
                                  Generating detailed analysis...
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}
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
                                        optIndex.toString()
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

      <AnimatePresence>
        {isModalOpen && (
          <ScoreModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            score={calculateScore()}
            total={generatedMCQs.length}
            wrongAnswers={wrongAnswers}
            onFeedback={handleFeedback}
            analysis={analysis}
            showAnalysis={showAnalysis}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

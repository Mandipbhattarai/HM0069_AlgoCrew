import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Youtube } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { DetailAnalysisProps } from "@/utils/types";

const extractRelevantInfo = (analysisText: string) => {
  const userAnswerMatch = analysisText.match(/\*\*User Answer:\*\*\s*(.*)/);
  const correctAnswerMatch = analysisText.match(
    /\*\*Correct Answer:\*\*\s*(.*)/
  );
  const explanationMatch = analysisText.match(
    /\*\*Explanation of Why the User Answer is Wrong:\*\*\s*([\s\S]*?)(\n\*\*|$)/
  );
  const correctReasoningMatch = analysisText.match(
    /\*\*Correct Reasoning:\*\*\s*([\s\S]*?)(\n\*\*|$)/
  );

  let extractedText = "";
  if (userAnswerMatch)
    extractedText += `**User Answer:** ${userAnswerMatch[1]}\n\n`;
  if (correctAnswerMatch)
    extractedText += `**Correct Answer:** ${correctAnswerMatch[1]}\n\n`;
  if (explanationMatch)
    extractedText += `**Explanation:** ${explanationMatch[1].trim()}\n\n`;
  if (correctReasoningMatch)
    extractedText += `**Correct Reasoning:** ${correctReasoningMatch[1].trim()}\n\n`;

  return extractedText.trim();
};

const QuizAnalysis = ({ analysis }: DetailAnalysisProps) => {
  if (!Array.isArray(analysis)) {
    return (
      <p className="text-red-600">Invalid data format: Expected an array.</p>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen  py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-6"
      >
        <h3 className="text-2xl font-semibold mb-6 flex items-center text-gray-800">
          <BookOpen className="h-7 w-7 mr-3 text-purple-600" /> Detailed
          Analysis
        </h3>
        {analysis.map((item, index) => {
          const relevantInfo = extractRelevantInfo(item.analysis);
          return (
            <Card
              key={index}
              className="shadow-xl rounded-2xl border bg-white p-6"
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relevantInfo ? (
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <ReactMarkdown>{relevantInfo}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No detailed analysis available.
                  </p>
                )}
                {item.youtube_video_url && (
                  <div className="mt-5">
                    <Button
                      asChild
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700  px-4 py-2 rounded-lg"
                    >
                      <a
                        href={item.youtube_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="text-white flex items-center gap-2">
                          <Youtube size={22} /> Watch Related Video
                        </div>
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>
    </div>
  );
};

export default QuizAnalysis;

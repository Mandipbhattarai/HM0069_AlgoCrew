// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   BarChart3,
//   Target,
//   TrendingUp,
//   ScrollText,
//   CheckCircle2,
// } from "lucide-react";
// import Navbar from "@/components/Navbar";
// import { FeedbackData } from "@/utils/types";

// const Feedback: React.FC = () => {
//   const location = useLocation();
//   const { topic, content } = location.state || { topic: "", content: "" };

//   const [feedback, setFeedback] = useState<FeedbackData | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   // Fetch feedback once when the component mounts
//   useEffect(() => {
//     const fetchFeedback = async () => {
//       if (!topic || !content) {
//         console.error("No topic or content provided.");
//         return;
//       }

//       try {
//         const response = await fetch("http://127.0.0.1:8000/analyze_content", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ topic, content }),
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch feedback");
//         }

//         const data: FeedbackData = await response.json();
//         console.log("Fetched Data:", data);
//         setFeedback(data);
//       } catch (error) {
//         console.error("Error fetching feedback:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeedback();

//     // Set up interval to refresh frontend every 10 seconds
//     const intervalId = setInterval(() => {
//       setFeedback((prevFeedback) => prevFeedback); // Trigger re-render without re-fetching
//     }, 10000);

//     // Clear the interval when component unmounts
//     return () => clearInterval(intervalId);
//   }, []); // Empty dependency array ensures this effect runs only once

//   // Return the loading spinner while the data is being fetched
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <main className="pt-20 pb-12 px-4">
//           <div className="max-w-6xl mx-auto">
//             <div className="flex justify-center items-center h-[calc(100vh-200px)]">
//               <div className="text-center">
//                 <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                 <p className="text-xl text-gray-600">Loading...</p>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // If feedback is fetched, display the content
//   if (feedback) {
//     // Handle readability_score with either space or underscore
//     const readabilityScore =
//       feedback?.readability_score || feedback?.readability_score_ || 0;

//     const metrics = [
//       {
//         icon: BarChart3,
//         label: "Readability Score",
//         value: `${readabilityScore.toFixed(1)}%`,
//         color: "bg-indigo-600",
//         percentage: readabilityScore,
//         description: "Measures clarity and ease of understanding.",
//       },
//       {
//         icon: Target,
//         label: "Relevance Score",
//         value:
//           feedback.relevance.charAt(0).toUpperCase() +
//           feedback.relevance.slice(1),
//         color: "bg-purple-600",
//         percentage: feedback.evaluation_score,
//         description: "How well the content aligns with the topic.",
//       },
//       {
//         icon: TrendingUp,
//         label: "Similarity Index (Cosine)",
//         value: `${(feedback.cosine_score * 100).toFixed(1)}%`,
//         color: "bg-blue-600",
//         percentage: feedback.cosine_score * 100,
//         description: "Content similarity assessment using cosine similarity.",
//       },
//       {
//         icon: TrendingUp,
//         label: "Similarity Index (Jaccard)",
//         value: `${(feedback.jaccard_index * 100).toFixed(1)}%`,
//         color: "bg-green-600",
//         percentage: feedback.jaccard_index * 100,
//         description: "Content similarity assessment using Jaccard index.",
//       },
//       {
//         icon: CheckCircle2,
//         label: "Plagiarism",
//         value: `${(feedback.plagiarism * 100).toFixed(1)}%`, // Convert to percentage
//         color: "bg-red-600",
//         percentage: feedback.plagiarism * 100,
//         description:
//           "Percentage of similarity with other content indicating potential plagiarism.",
//       },
//     ];

//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <main className="pt-20 pb-12 px-4">
//           <div className="max-w-6xl mx-auto">
//             <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-10">
//               Assignment Feedback Analysis
//             </h1>
//             <p className="text-gray-600 mb-8">
//               Comprehensive evaluation metrics and insights
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {metrics.map((metric, index) => (
//                 <MetricCard key={index} {...metric} />
//               ))}
//             </div>

//             <div className="mt-10 bg-white rounded-xl border p-6 shadow-sm">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <ScrollText className="w-5 h-5 mr-2 text-indigo-600" /> Detailed
//                 Feedback
//               </h2>
//               <div className="text-gray-700 bg-gray-100 p-4 rounded-lg">
//                 <pre className="whitespace-pre-wrap">
//                   {feedback.overall_feedback}
//                 </pre>
//               </div>
//             </div>

//             {/* Display AI-generated content */}
//             <div className="mt-10 bg-white rounded-xl border p-6 shadow-sm">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <ScrollText className="w-5 h-5 mr-2 text-indigo-600" />{" "}
//                 AI-Generated Content
//               </h2>
//               <div className="text-gray-700 bg-gray-100 p-4 rounded-lg">
//                 <pre className="whitespace-pre-wrap">{feedback.ai_text}</pre>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // In case of an error
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <main className="pt-20 pb-12 px-4">
//         <div className="max-w-6xl mx-auto">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-10">
//             Error: Unable to fetch feedback.
//           </h1>
//           <p className="text-gray-600 mb-8">
//             There was an issue fetching the feedback data. Please try again
//             later.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// interface MetricCardProps {
//   icon: React.ElementType;
//   label: string;
//   value: string;
//   color: string;
//   percentage: number;
//   description: string;
// }

// const MetricCard: React.FC<MetricCardProps> = ({
//   icon: Icon,
//   label,
//   value,
//   color,
//   percentage,
//   description,
// }) => {
//   return (
//     <div className="bg-white rounded-xl border p-6 shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
//         <div className={`p-2 ${color} rounded-lg`}>
//           <Icon className="h-6 w-6 text-white" />
//         </div>
//       </div>
//       <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
//       <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
//         <div
//           className={`h-2 rounded-full ${color}`}
//           style={{ width: `${percentage}%` }}
//         />
//       </div>
//       <p className="text-sm text-gray-600">{description}</p>
//     </div>
//   );
// };

// export default Feedback;
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart3,
  Target,
  TrendingUp,
  ScrollText,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import emailjs from "emailjs-com";

interface FeedbackData {
  relevance: string;
  evaluation_score: number;
  overall_feedback: string;
  plagiarism: number;
  readability_score?: number; // Updated for optional field
  readability_score_?: number; // Added for optional field with underscore
  cosine_score: number;
  jaccard_index: number;
  ai_text: string; // Added ai_text to store the AI-generated content
}

const Feedback: React.FC = () => {
  const location = useLocation();
  const { topic, content } = location.state || { topic: "", content: "" };

  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch feedback once when the component mounts
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!topic || !content) {
        console.error("No topic or content provided.");
        return;
      }

      try {
        const response = await fetch(import.meta.env.VITE_PYTHON_BACKEND, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic, content }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }

        const data: FeedbackData = await response.json();
        console.log("Fetched Data:", data);

        setFeedback(data);

        // ✅ Send Email with the fetched feedback data
        emailjs
          .send(
            import.meta.env.VITE_EMAIL_JS_SERVICE_ID, // Your EmailJS service ID
            import.meta.env.VITE_EMAIL_JS_TEMPLATE_ID, // Your EmailJS template ID
            {
              topic: topic,
              recipient_email: "mandip.bhattarai22@pccoepune.org", // Replace with dynamic recipient if needed
              relevance: data.relevance || "N/A",
              evaluation_score: data.evaluation_score || "N/A",
              overall_feedback: data.overall_feedback || "N/A",
              plagiarism: data.plagiarism || "N/A",
              readability_score: data.readability_score || "N/A",
              cosine_score: data.cosine_score || "N/A",
              jaccard_index: data.jaccard_index || "N/A",
              ai_text_preview: data.ai_text
                ? data.ai_text.substring(0, 100) + "..."
                : "No AI text available",
              full_json: JSON.stringify(data, null, 2),
              timestamp: new Date().toISOString(),
            },
            import.meta.env.VITE_EMAIL_JS_CLIENT_ID // Your EmailJS Public Key
          )
          .then((response) => {
            console.log("Email sent successfully:", response);
          })
          .catch((error) => {
            console.error("Email sending failed:", error);
          });
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [topic, content]);
  // Return the loading spinner while the data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If feedback is fetched, display the content
  if (feedback) {
    // Handle readability_score with either space or underscore
    const readabilityScore =
      feedback?.readability_score || feedback?.readability_score_ || 0;

    const metrics = [
      {
        icon: BarChart3,
        label: "Readability Score",
        value: `${readabilityScore.toFixed(1)}%`,
        color: "bg-indigo-600",
        percentage: readabilityScore,
        description: "Measures clarity and ease of understanding.",
      },
      {
        icon: Target,
        label: "Relevance Score",
        value:
          feedback.relevance.charAt(0).toUpperCase() +
          feedback.relevance.slice(1),
        color: "bg-purple-600",
        percentage: feedback.evaluation_score,
        description: "How well the content aligns with the topic.",
      },
      {
        icon: TrendingUp,
        label: "Similarity Index (Cosine)",
        value: `${(feedback.cosine_score * 100).toFixed(1)}%`,
        color: "bg-blue-600",
        percentage: feedback.cosine_score * 100,
        description: "Content similarity assessment using cosine similarity.",
      },
      {
        icon: TrendingUp,
        label: "Similarity Index (Jaccard)",
        value: `${(feedback.jaccard_index * 100).toFixed(1)}%`,
        color: "bg-green-600",
        percentage: feedback.jaccard_index * 100,
        description: "Content similarity assessment using Jaccard index.",
      },
      {
        icon: CheckCircle2,
        label: "Plagiarism",
        value: `${(feedback.plagiarism * 100).toFixed(1)}%`, // Convert to percentage
        color: "bg-red-600",
        percentage: feedback.plagiarism * 100,
        description:
          "Percentage of similarity with other content indicating potential plagiarism.",
      },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-10">
              Assignment Feedback Analysis
            </h1>
            <p className="text-gray-600 mb-8">
              Comprehensive evaluation metrics and insights
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            <div className="mt-10 bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ScrollText className="w-5 h-5 mr-2 text-indigo-600" /> Detailed
                Feedback
              </h2>
              <div className="text-gray-700 bg-gray-100 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap">
                  {feedback.overall_feedback}
                </pre>
              </div>
            </div>

            {/* Display AI-generated content */}
            <div className="mt-10 bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ScrollText className="w-5 h-5 mr-2 text-indigo-600" />{" "}
                AI-Generated Content
              </h2>
              <div className="text-gray-700 bg-gray-100 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap">{feedback.ai_text}</pre>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // In case of an error
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-10">
            Error: Unable to fetch feedback.
          </h1>
          <p className="text-gray-600 mb-8">
            There was an issue fetching the feedback data. Please try again
            later.
          </p>
        </div>
      </main>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  percentage: number;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  percentage,
  description,
}) => {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default Feedback;

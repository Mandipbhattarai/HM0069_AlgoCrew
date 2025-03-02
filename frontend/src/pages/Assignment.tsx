import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Navbar from "@/components/Navbar";

export default function Assignment() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");

  const navigate = useNavigate(); // Initialize navigate

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading:", file.name); // Debugging
      const response = await fetch(
        "https://picthackathon.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      console.log("Response:", data); // Debugging
      setExtractedText(data.extracted_text);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!topic || !extractedText) {
      alert(
        "Please provide a title and ensure extracted content is available."
      );
      return;
    }

    // Navigate to /feedback with topic and extracted text as state
    navigate("/feedback", { state: { topic, content: extractedText } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Navbar />
      <div className="w-full max-w-6xl px-10 pt-20 pb-12">
        <main>
          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-16 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-purple-600">
                Upload Your Solution
              </h2>
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-20 text-center bg-white h-[250px] flex flex-col items-center justify-center">
                {file ? (
                  <p className="text-purple-600 mb-2">{file.name}</p>
                ) : (
                  <>
                    <Upload className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                    <p className="text-purple-600 mb-2">
                      Drag and drop your file here
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                {!file && (
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer bg-purple-200 px-4 py-2 rounded-md text-purple-700"
                  >
                    Choose File
                  </label>
                )}
              </div>

              {/* Centered Upload Button */}
              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? "Processing..." : "Submit"}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Display Extracted Text */}
          {extractedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-purple-600">
                  Extracted Text
                </h2>
                <Textarea
                  value={extractedText}
                  readOnly
                  className="w-full h-40"
                />
              </Card>
              <div className="mt-6">
                <input
                  type="text"
                  placeholder="Enter title"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!topic || !extractedText}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                  Submit Title and Content
                </Button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

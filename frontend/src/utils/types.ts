export interface Classroom {
  id: string;
  name: string;
  section?: string;
}

export interface Course {
  id: string;
  name: string;
  section?: string;
  room?: string;
  courseState: string;
  alternateLink: string;
  creationTime: string;
}

export interface CourseResponse {
  courses: Course[];
}

export interface MCQProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AnalysisProps {
  question: string;
  analysis: string;
  youtube_video_url: string;
}

export interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  total: number;
  wrongAnswers: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
  }[];
  onFeedback: () => void;
  analysis: AnalysisProps[];
  showAnalysis: boolean;
}

export interface AnalysisItemProps {
  question: string;
  analysis: string;
  youtube_video_url?: string;
}

export interface DetailAnalysisProps {
  analysis: AnalysisItemProps[];
}

export interface FeedbackData {
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

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "excused";
}

export interface SubjectAttendance {
  id: string;
  name: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  records: AttendanceRecord[];
}

export interface Class {
  id: string;
  name: string;
  students: Student[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
}

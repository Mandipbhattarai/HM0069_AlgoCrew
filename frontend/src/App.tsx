import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Dashboard from "./pages/Dashboard";
import Classroom from "./pages/Classroom";
import MCQGenerator from "./pages/MCQGenerator";
import Feedback from "./pages/Feedback";
import ClassroomViewer from "./components/custom/ClassroomViewer";
import AttendancePage from "./pages/Attendacne";
import TeacherAttendancePage from "./pages/TeacherAttendancePortal";
import TeacherQuizPage from "./pages/TeacherQuizPage";
import StudentQuizPage from "./pages/StudentQuizPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import Assignment from "./pages/Assignment";
function App() {
  return (
    <GoogleOAuthProvider clientId="707090231940-d10jbf8rjelqlm0c2hunbltbjm5hp2p4.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/mcqgenerator" element={<MCQGenerator />} />
          <Route path="/classroom/:id" element={<ClassroomViewer />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/assignment" element={<Assignment />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/teacher" element={<TeacherAttendancePage />} />
          <Route path="/teacher-quiz" element={<TeacherQuizPage />} />
          <Route path="/student-quiz" element={<StudentQuizPage />} />
          <Route path="/teacherDashboard" element={<TeacherDashboard />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Dashboard from "./pages/Dashboard";
import Classroom from "./pages/Classroom";
import MCQGenerator from "./pages/MCQGenerator";
import ClassroomViewer from "./components/custom/Classroom";
import Feedback from "./pages/Feedback";

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
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

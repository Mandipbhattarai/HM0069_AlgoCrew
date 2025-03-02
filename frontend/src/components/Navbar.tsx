import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setAccessToken(storedToken);
      setUser({});
    }
  }, []);

  const CLASSROOM_SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses",
    "https://www.googleapis.com/auth/classroom.coursework.students",
    "https://www.googleapis.com/auth/classroom.coursework.me",
    "https://www.googleapis.com/auth/classroom.rosters",
    "https://www.googleapis.com/auth/classroom.profile.emails",
    "https://www.googleapis.com/auth/classroom.profile.photos",
    "https://www.googleapis.com/auth/classroom.guardianlinks.students",
    "https://www.googleapis.com/auth/classroom.announcements",
    "https://www.googleapis.com/auth/classroom.topics",
    "https://www.googleapis.com/auth/classroom.push-notifications",
  ].join(" ");

  // Handle login
  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      const token = codeResponse.access_token;
      setAccessToken(token);
      localStorage.setItem("accessToken", token);
      fetchUserProfile(token);
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Login Failed:", error);
      setError("Failed to login with Google");
    },
    scope: CLASSROOM_SCOPES,
  });

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(
        "https://classroom.googleapis.com/v1/userProfiles/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();

      setUser({
        name: data.name.fullName,
        email: data.emailAddress,
        profilePicture: data.photoUrl,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Error fetching user profile");
    }
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setUser(null);
    navigate("/");
  };
  if (error) {
    return <div className="text-red-500">Cannot load the resources</div>;
  }
  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              EduPlatform
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {accessToken ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-purple-700 hover:text-purple-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/classroom"
                  className="text-purple-700 hover:text-purple-900"
                >
                  Classroom
                </Link>
                <Link
                  to="/mcqgenerator"
                  className="text-purple-700 hover:text-purple-900"
                >
                  Quiz
                </Link>
                <Link
                  to="/assignment"
                  className="text-purple-700 hover:text-purple-900"
                >
                  Assignment
                </Link>
                <Link
                  to="/attendance"
                  className="text-purple-700 hover:text-purple-900"
                >
                  Attendance
                </Link>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              /* Button for unauthenticated users */
              <Button
                onClick={() => login()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90"
              >
                Join Classroom
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

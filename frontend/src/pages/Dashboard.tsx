import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  GraduationCap,
  School,
  ExternalLink,
  BookOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Course, CourseResponse } from "@/utils/types";
import Navbar from "@/components/Navbar";

// Set up axios interceptor to attach token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("name");
  const [studentName, setStudentName] = useState<string | null>(null);
  const [showAllCourses, setShowAllCourses] = useState(false);

  const INITIAL_COURSES_TO_SHOW = 6;

  useEffect(() => {
    const name = localStorage.getItem("studentName") || "Student";
    setStudentName(name);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "https://classroom.googleapis.com/v1/courses",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data: CourseResponse = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const activeCourses = courses.filter(
    (course) => course.courseState === "ACTIVE"
  );

  const filteredAndSortedCourses = activeCourses
    .filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.section &&
          course.section.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return (
          new Date(b.creationTime).getTime() -
          new Date(a.creationTime).getTime()
        );
      }
    });

  const displayedCourses = showAllCourses
    ? filteredAndSortedCourses
    : filteredAndSortedCourses.slice(0, INITIAL_COURSES_TO_SHOW);

  const hasMoreCourses =
    filteredAndSortedCourses.length > INITIAL_COURSES_TO_SHOW;

  const stats = [
    {
      icon: School,
      label: "Active Courses",
      value: `${activeCourses.length}`,
      color: "text-blue-500",
    },
    {
      icon: GraduationCap,
      label: "Total Courses",
      value: `${courses.length}`,
      color: "text-purple-500",
    },
    {
      icon: Calendar,
      label: "Current Term",
      value: "2024-25",
      color: "text-green-500",
    },
    {
      icon: Users,
      label: "Course Groups",
      value: `${activeCourses.length}`,
      color: "text-yellow-500",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCourseClick = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the link's default behavior
    navigate(`/classroom/${courseId}`); // Navigate to the submissions route
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-medium">Error loading courses</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-500 hover:text-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome, {studentName}!</h1>
          <p className="text-gray-600">
            Manage your courses and track your academic progress
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-full bg-opacity-10 ${stat.color.replace(
                      "text",
                      "bg"
                    )}`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Active Courses</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "date")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card
                  className="relative h-full p-6 cursor-pointer transform transition-all duration-200 hover:shadow-xl hover:scale-102 border-2 border-transparent hover:border-blue-500"
                  onClick={(e) => handleCourseClick(course.id, e)}
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={course.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-gray-500 hover:text-blue-500" />
                    </a>
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                          {course.name}
                        </h3>
                      </div>
                      {course.section && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Section {course.section}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(course.creationTime)}</span>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredAndSortedCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "You have no active courses at the moment"}
              </p>
            </div>
          )}

          {hasMoreCourses && !searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <button
                onClick={() => setShowAllCourses(!showAllCourses)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                hover:from-purple-700 hover:to-blue-700 text-white transition-colors duration-200 
                font-medium rounded-lg"
              >
                {showAllCourses ? (
                  <>
                    Show Less
                    <ChevronDown className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    View All Courses
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Course Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Course Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Active Courses</p>
                  <p className="text-sm text-gray-600">
                    You have {activeCourses.length} active courses
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Latest Course</p>
                  <p className="text-sm text-gray-600">
                    {activeCourses[0]?.name || "No active courses"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

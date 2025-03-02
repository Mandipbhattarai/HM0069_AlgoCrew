import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  GraduationCap,
  School,
  BookOpen,
  BarChart3,
  Award,
  Flame,
  CheckCircle,
  Star,
  TrendingUp,
  Activity,
  Target,
  Bell,
  MessageSquare,
  Settings,
  HelpCircle,
  BookMarked,
  Video,
  PenTool,
  ClipboardList,
  UserCheck,
  Edit,
  Mail,
  Briefcase,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";

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

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teacherName, setTeacherName] = useState<string>("Teacher");
  const [activeClasses, setActiveClasses] = useState<number>(5);
  const [totalStudents, setTotalStudents] = useState<number>(142);
  const [pendingGrading, setPendingGrading] = useState<number>(17);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("week");
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(
    null
  );

  // Mock class data
  const classData = [
    {
      id: 1,
      name: "Physics 101",
      students: 32,
      averageGrade: 87,
      attendanceRate: 92,
    },
    {
      id: 2,
      name: "Advanced Chemistry",
      students: 28,
      averageGrade: 84,
      attendanceRate: 89,
    },
    {
      id: 3,
      name: "Calculus II",
      students: 35,
      averageGrade: 79,
      attendanceRate: 85,
    },
    {
      id: 4,
      name: "Computer Science Fundamentals",
      students: 30,
      averageGrade: 91,
      attendanceRate: 94,
    },
    {
      id: 5,
      name: "English Literature",
      students: 27,
      averageGrade: 88,
      attendanceRate: 90,
    },
  ];

  // Mock student performance data
  const studentPerformanceData = [65, 72, 85, 90, 78, 82, 88];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Mock upcoming deadlines
  const upcomingDeadlines = [
    {
      id: 1,
      title: "Physics Quiz",
      class: "Physics 101",
      dueDate: "2025-03-15",
      daysLeft: 2,
    },
    {
      id: 2,
      title: "Literature Essay Grading",
      class: "English Literature",
      dueDate: "2025-03-18",
      daysLeft: 5,
    },
    {
      id: 3,
      title: "Algorithm Project Review",
      class: "Computer Science Fundamentals",
      dueDate: "2025-03-20",
      daysLeft: 7,
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      action: "Graded assignments",
      class: "Calculus II",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Updated course materials",
      class: "Physics 101",
      time: "Yesterday",
    },
    {
      id: 3,
      action: "Conducted online lecture",
      class: "Computer Science Fundamentals",
      time: "2 days ago",
    },
    {
      id: 4,
      action: "Provided feedback",
      class: "English Literature",
      time: "3 days ago",
    },
  ];

  // Mock student concerns
  const studentConcerns = [
    {
      id: 1,
      student: "Emma Thompson",
      issue: "Assignment clarification",
      class: "Physics 101",
      priority: "high",
    },
    {
      id: 2,
      student: "James Wilson",
      issue: "Extension request",
      class: "Calculus II",
      priority: "medium",
    },
    {
      id: 3,
      student: "Sophia Chen",
      issue: "Grade dispute",
      class: "English Literature",
      priority: "high",
    },
    {
      id: 4,
      student: "Michael Brown",
      issue: "Attendance issue",
      class: "Advanced Chemistry",
      priority: "low",
    },
  ];

  // Mock attendance overview
  const attendanceOverview = [
    { class: "Physics 101", present: 29, absent: 3, rate: 90.6 },
    { class: "Advanced Chemistry", present: 25, absent: 3, rate: 89.3 },
    { class: "Calculus II", present: 30, absent: 5, rate: 85.7 },
    {
      class: "Computer Science Fundamentals",
      present: 28,
      absent: 2,
      rate: 93.3,
    },
    { class: "English Literature", present: 24, absent: 3, rate: 88.9 },
  ];

  // Enhanced quick actions
  const quickActions = [
    {
      id: "attendance",
      title: "Attendance",
      icon: UserCheck,
      path: "/teacher",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "assignments",
      title: "Assignments",
      icon: FileCheck,
      path: "/teacher-quiz",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "schedule",
      title: "Schedule",
      icon: Calendar,
      path: "/teacher/schedule",
      color: "from-green-500 to-green-600",
    },
    {
      id: "grades",
      title: "Grades",
      icon: BarChart3,
      path: "/teacher/grades",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      id: "courses",
      title: "Courses",
      icon: BookMarked,
      path: "/classroom",
      color: "from-red-500 to-red-600",
    },
    {
      id: "lectures",
      title: "Lectures",
      icon: Video,
      path: "/teacher/lectures",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getAttendanceBgColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "bg-red-100 text-red-700";
    if (priority === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const handleQuickActionClick = (actionId: string, path: string) => {
    setActiveQuickAction(actionId);

    // Add a small delay for the animation effect before navigating
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

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
          <h1 className="text-3xl font-bold mb-2">Welcome, {teacherName}!</h1>
          <p className="text-gray-600">
            Here's an overview of your classes, students, and teaching
            activities
          </p>
        </motion.div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <School className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Classes
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{activeClasses}</h3>
            <p className="text-gray-600 text-sm">
              Active classes this semester
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Students
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{totalStudents}</h3>
            <p className="text-gray-600 text-sm">Total students enrolled</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                Grading
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{pendingGrading}</h3>
            <p className="text-gray-600 text-sm">Assignments pending review</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Attendance
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">89.5%</h3>
            <p className="text-gray-600 text-sm">Average attendance rate</p>
          </motion.div>
        </div>

        {/* Class Overview and Student Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Class Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Class Overview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/teacher/classes")}
              >
                Manage Classes
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Class Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Students
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Avg. Grade
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Attendance
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classData.map((classItem) => (
                    <tr key={classItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {classItem.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {classItem.students}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            classItem.averageGrade >= 90
                              ? "text-green-600"
                              : classItem.averageGrade >= 75
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {classItem.averageGrade}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${getAttendanceBgColor(
                                classItem.attendanceRate
                              )}`}
                              style={{ width: `${classItem.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {classItem.attendanceRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-800">
                            <Users className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Student Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Student Performance</h2>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">Average submission rate</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedTimeframe("week")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    selectedTimeframe === "week"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setSelectedTimeframe("month")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    selectedTimeframe === "month"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="h-48 flex items-end space-x-2">
              {studentPerformanceData.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all duration-500 ease-in-out"
                    style={{ height: `${value}%`, opacity: 0.7 + index / 10 }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600">
                    {weekdays[index]}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/teacher/analytics")}
              >
                View Detailed Analytics
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Deadlines and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`p-2 rounded-full ${
                      deadline.daysLeft <= 2
                        ? "bg-red-100"
                        : deadline.daysLeft <= 5
                        ? "bg-yellow-100"
                        : "bg-green-100"
                    }`}
                  >
                    <Calendar
                      className={`h-5 w-5 ${
                        deadline.daysLeft <= 2
                          ? "text-red-600"
                          : deadline.daysLeft <= 5
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{deadline.title}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          deadline.daysLeft <= 2
                            ? "bg-red-100 text-red-700"
                            : deadline.daysLeft <= 5
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {deadline.daysLeft}{" "}
                        {deadline.daysLeft === 1 ? "day" : "days"} left
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{deadline.class}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 text-sm"
                onClick={() => navigate("/teacher/deadlines")}
              >
                View All Deadlines
              </Button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{activity.action}</h3>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.class}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 text-sm"
                onClick={() => navigate("/teacher/activity")}
              >
                View Activity History
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Student Concerns and Attendance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Student Concerns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Student Concerns</h2>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {studentConcerns.length} pending
              </span>
            </div>
            <div className="space-y-4">
              {studentConcerns.map((concern) => (
                <div
                  key={concern.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`p-2 rounded-full ${
                      concern.priority === "high"
                        ? "bg-red-100"
                        : concern.priority === "medium"
                        ? "bg-yellow-100"
                        : "bg-blue-100"
                    }`}
                  >
                    <AlertCircle
                      className={`h-5 w-5 ${
                        concern.priority === "high"
                          ? "text-red-600"
                          : concern.priority === "medium"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{concern.student}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(
                          concern.priority
                        )}`}
                      >
                        {concern.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {concern.issue}
                    </p>
                    <p className="text-xs text-gray-500">{concern.class}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 text-sm"
                onClick={() => navigate("/teacher/concerns")}
              >
                View All Concerns
              </Button>
            </div>
          </motion.div>

          {/* Attendance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
            <div className="space-y-4">
              {attendanceOverview.map((item, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{item.class}</h3>
                    <span
                      className={`text-sm font-medium ${getAttendanceColor(
                        item.rate
                      )}`}
                    >
                      {item.rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getAttendanceBgColor(
                          item.rate
                        )}`}
                        style={{ width: `${item.rate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>Present: {item.present}</span>
                    <span>Absent: {item.absent}</span>
                    <span>Total: {item.present + item.absent}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 text-sm"
                onClick={() => navigate("/teacher/attendance")}
              >
                View Detailed Attendance
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickActionClick(action.id, action.path)}
                className={`relative overflow-hidden rounded-xl shadow-md transition-all duration-300 ${
                  activeQuickAction === action.id
                    ? "ring-2 ring-offset-2 ring-blue-500"
                    : ""
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90`}
                ></div>
                <div className="relative p-6 flex flex-col items-center justify-center h-full">
                  <action.icon className="h-8 w-8 text-white mb-3" />
                  <span className="text-white font-medium text-sm">
                    {action.title}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tools & Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tools & Resources</h2>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <HelpCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center mb-3">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-800">Lesson Planner</h3>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Create and manage your lesson plans with our interactive tool.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => navigate("/teacher/planner")}
              >
                Open Planner
              </Button>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center mb-3">
                <ClipboardList className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-purple-800">Grade Assistant</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                AI-powered grading assistant to help you grade assignments
                faster.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                onClick={() => navigate("/teacher/grade-assistant")}
              >
                Start Grading
              </Button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center mb-3">
                <Mail className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium text-green-800">Send MCQs</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Send MCQs to students on a specific topics and Courses.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => navigate("/teacher/communication")}
              >
                Send Messages
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

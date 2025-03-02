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
  PenTool
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { mockAttendanceData } from "../utils/data";

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
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState<string>("Student");
  const [activeStreak, setActiveStreak] = useState<number>(12);
  const [totalLoginDays, setTotalLoginDays] = useState<number>(45);
  const [completionRate, setCompletionRate] = useState<number>(87);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("week");
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  
  // Calculate overall attendance
  const totalClasses = mockAttendanceData.reduce((sum, subject) => sum + subject.totalClasses, 0);
  const totalAttended = mockAttendanceData.reduce((sum, subject) => sum + subject.attended, 0);
  const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
  
  // Mock activity data
  const activityData = [65, 40, 85, 30, 70, 50, 90];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Mock achievements
  const achievements = [
    { id: 1, title: "Perfect Week", description: "100% attendance for a week", icon: CheckCircle, completed: true, progress: 100 },
    { id: 2, title: "Knowledge Seeker", description: "Complete 50 assignments", icon: BookOpen, completed: false, progress: 76 },
    { id: 3, title: "Early Bird", description: "Login before 8 AM for 5 days", icon: Clock, completed: true, progress: 100 },
    { id: 4, title: "Top Performer", description: "Score 90%+ in 3 subjects", icon: Award, completed: false, progress: 67 }
  ];
  
  // Mock upcoming deadlines
  const upcomingDeadlines = [
    { id: 1, title: "Physics Assignment", subject: "Physics", dueDate: "2025-03-15", daysLeft: 2 },
    { id: 2, title: "Literature Essay", subject: "English Literature", dueDate: "2025-03-18", daysLeft: 5 },
    { id: 3, title: "Algorithm Project", subject: "Computer Science", dueDate: "2025-03-20", daysLeft: 7 }
  ];
  
  // Mock recent activities
  const recentActivities = [
    { id: 1, action: "Submitted assignment", subject: "Mathematics", time: "2 hours ago" },
    { id: 2, action: "Attended class", subject: "Physics", time: "Yesterday" },
    { id: 3, action: "Completed quiz", subject: "Computer Science", time: "2 days ago" },
    { id: 4, action: "Viewed lecture notes", subject: "English Literature", time: "3 days ago" }
  ];
  
  // Mock performance by subject
  const subjectPerformance = [
    { subject: "Mathematics", score: 92, trend: "up" },
    { subject: "Physics", score: 85, trend: "up" },
    { subject: "Computer Science", score: 95, trend: "up" },
    { subject: "English Literature", score: 78, trend: "down" },
    { subject: "Chemistry", score: 82, trend: "stable" }
  ];

  // Enhanced quick actions
  const quickActions = [
    { id: "attendance", title: "Attendance", icon: Users, path: "/attendance", color: "from-purple-500 to-purple-600" },
    { id: "assignments", title: "Assignments", icon: FileText, path: "/assignments", color: "from-blue-500 to-blue-600" },
    { id: "schedule", title: "Schedule", icon: Calendar, path: "/schedule", color: "from-green-500 to-green-600" },
    { id: "grades", title: "Grades", icon: BarChart3, path: "/grades", color: "from-yellow-500 to-yellow-600" },
    { id: "courses", title: "Courses", icon: BookMarked, path: "/courses", color: "from-red-500 to-red-600" },
    { id: "notes", title: "Notes", icon: PenTool, path: "/notes", color: "from-pink-500 to-pink-600" },
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
  
  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
    return <div className="h-4 w-4 border-t-2 border-gray-400"></div>;
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
          <h1 className="text-3xl font-bold mb-2">Welcome, {studentName}!</h1>
          <p className="text-gray-600">
            Here's an overview of your academic progress and activity
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
              <div className="p-3 bg-purple-100 rounded-full">
                <Flame className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                Streak
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{activeStreak} days</h3>
            <p className="text-gray-600 text-sm">Current active streak</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Activity
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{totalLoginDays} days</h3>
            <p className="text-gray-600 text-sm">Total active days this term</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Tasks
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{completionRate}%</h3>
            <p className="text-gray-600 text-sm">Assignment completion rate</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                Attendance
              </span>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${getAttendanceColor(overallPercentage)}`}>
              {overallPercentage.toFixed(1)}%
            </h3>
            <p className="text-gray-600 text-sm">Overall attendance rate</p>
          </motion.div>
        </div>

        {/* Activity Chart and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Activity Overview</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedTimeframe("week")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedTimeframe === "week" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setSelectedTimeframe("month")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    selectedTimeframe === "month" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
            
            <div className="h-64 flex items-end space-x-2">
              {activityData.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-purple-500 rounded-t-md transition-all duration-500 ease-in-out"
                    style={{ height: `${value}%`, opacity: 0.7 + (index / 10) }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-600">{weekdays[index]}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${achievement.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <achievement.icon className={`h-5 w-5 ${achievement.completed ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <span className="text-xs font-medium">
                        {achievement.progress}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{achievement.description}</p>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${achievement.completed ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                className="text-purple-600 hover:text-purple-700 text-sm"
                onClick={() => {/* View all achievements */}}
              >
                View All Achievements
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
                <div key={deadline.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-full ${
                    deadline.daysLeft <= 2 ? 'bg-red-100' : deadline.daysLeft <= 5 ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <Calendar className={`h-5 w-5 ${
                      deadline.daysLeft <= 2 ? 'text-red-600' : deadline.daysLeft <= 5 ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{deadline.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        deadline.daysLeft <= 2 ? 'bg-red-100 text-red-700' : 
                        deadline.daysLeft <= 5 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {deadline.daysLeft} {deadline.daysLeft === 1 ? 'day' : 'days'} left
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{deadline.subject}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                className="text-purple-600 hover:text-purple-700 text-sm"
                onClick={() => {/* View all deadlines */}}
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
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{activity.action}</h3>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.subject}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                className="text-purple-600 hover:text-purple-700 text-sm"
                onClick={() => {/* View activity history */}}
              >
                View Activity History
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Performance by Subject */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">Performance by Subject</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {subjectPerformance.map((subject, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800">{subject.subject}</h3>
                  {getTrendIcon(subject.trend)}
                </div>
                <div className="flex items-end space-x-2">
                  <span className="text-2xl font-bold">{subject.score}%</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        subject.score >= 90 ? 'bg-green-500' : 
                        subject.score >= 75 ? 'bg-blue-500' : 
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
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
                  activeQuickAction === action.id ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90`}></div>
                <div className="relative p-6 flex flex-col items-center justify-center h-full">
                  <action.icon className="h-8 w-8 text-white mb-3" />
                  <span className="text-white font-medium text-sm">{action.title}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* Help & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Help & Support</h2>
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
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-purple-800">
              Need help with your studies? Our AI tutor is available 24/7 to assist you with any subject.
            </p>
            <Button 
              className="mt-3 bg-purple-600 hover:bg-purple-700"
              onClick={() => {/* Open AI tutor */}}
            >
              Ask AI Tutor
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
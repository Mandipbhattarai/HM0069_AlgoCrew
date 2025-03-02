import {
  Brain,
  CheckCircle,
  FileText,
  LineChart,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";
import { Class, Subject, SubjectAttendance } from "./types";

export const features = [
  {
    icon: Brain,
    title: "AI-Powered Resource Management",
    description:
      "Leverage AI to optimize educational resources, schedules, and finances, ensuring smoother operations.",
  },
  {
    icon: Users,
    title: "Collaborative Teaching & Learning",
    description:
      "Foster communication between educators and students through seamless collaborative tools.",
  },
  {
    icon: LineChart,
    title: "Data-Driven Insights",
    description:
      "Gain insights into academic progress, resource usage, and financial management for smarter decision-making.",
  },
  {
    icon: MessageSquare,
    title: "Instant Communication",
    description:
      "Enable real-time communication between educators and students to enhance engagement and feedback.",
  },
];

export const steps = [
  {
    icon: FileText,
    title: "Manage Resources",
    description:
      "Streamline the management of educational resources such as materials, finances, and schedules.",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description:
      "Distribute quiz results and updates instantly, ensuring students receive immediate feedback.",
  },
  {
    icon: CheckCircle,
    title: "Personalized Insights",
    description:
      "Provide educators and students with personalized dashboards and reports to track progress and improve performance.",
  },
];

export const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Student, Computer Science",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    quote:
      "This system has made my learning experience much more organized. I get instant updates and personalized feedback, which helps me stay on track.",
  },
  {
    name: "Dr. Michael Chen",
    role: "Professor, Engineering",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    quote:
      "The integration of resource management and real-time communication makes managing classrooms and assignments much more efficient.",
  },
  {
    name: "Emily Rodriguez",
    role: "Teaching Assistant",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80",
    quote:
      "The seamless sharing of resources and the ability to track student progress in real-time has greatly improved my work with students.",
  },
];

// Mock attendance data for student view
export const mockAttendanceData: SubjectAttendance[] = [
  {
    id: "1",
    name: "Mathematics",
    totalClasses: 25,
    attended: 22,
    percentage: 88,
    records: Array.from({ length: 25 }, (_, i) => ({
      id: `math-${i + 1}`,
      date: new Date(2025, 0, i + 1).toISOString(),
      status: i < 22 ? "present" : "absent",
    })),
  },
  {
    id: "2",
    name: "Physics",
    totalClasses: 20,
    attended: 19,
    percentage: 95,
    records: Array.from({ length: 20 }, (_, i) => ({
      id: `physics-${i + 1}`,
      date: new Date(2025, 0, i + 1).toISOString(),
      status: i < 19 ? "present" : "absent",
    })),
  },
  {
    id: "3",
    name: "Chemistry",
    totalClasses: 22,
    attended: 18,
    percentage: 81.8,
    records: Array.from({ length: 22 }, (_, i) => ({
      id: `chem-${i + 1}`,
      date: new Date(2025, 0, i + 1).toISOString(),
      status: i < 18 ? "present" : "absent",
    })),
  },
  {
    id: "4",
    name: "Computer Science",
    totalClasses: 18,
    attended: 17,
    percentage: 94.4,
    records: Array.from({ length: 18 }, (_, i) => ({
      id: `cs-${i + 1}`,
      date: new Date(2025, 0, i + 1).toISOString(),
      status: i < 17 ? "present" : "absent",
    })),
  },
  {
    id: "5",
    name: "English",
    totalClasses: 15,
    attended: 10,
    percentage: 66.7,
    records: Array.from({ length: 15 }, (_, i) => ({
      id: `eng-${i + 1}`,
      date: new Date(2025, 0, i + 1).toISOString(),
      status: i < 10 ? "present" : "absent",
    })),
  },
  {
    id: "6",
    name: "History",
    totalClasses: 12,
    attended: 9,
    percentage: 75,
    records: Array.from({ length: 12 }, (_, i) => ({
      id: `hist-${i + 1}`,
      date: new Date(2025, 0, i + 1).toISOString(),
      status: i < 9 ? "present" : "absent",
    })),
  },
];

// Mock classes for teacher view
export const mockClasses: Class[] = [
  {
    id: "class-1",
    name: "Class 10-A",
    students: [
      { id: "student-1", name: "Aiden Smith", rollNumber: "10A01" },
      { id: "student-2", name: "Sophia Johnson", rollNumber: "10A02" },
      { id: "student-3", name: "Ethan Williams", rollNumber: "10A03" },
      { id: "student-4", name: "Olivia Brown", rollNumber: "10A04" },
      { id: "student-5", name: "Noah Jones", rollNumber: "10A05" },
      { id: "student-6", name: "Emma Davis", rollNumber: "10A06" },
      { id: "student-7", name: "Liam Miller", rollNumber: "10A07" },
      { id: "student-8", name: "Ava Wilson", rollNumber: "10A08" },
      { id: "student-9", name: "Lucas Moore", rollNumber: "10A09" },
      { id: "student-10", name: "Isabella Taylor", rollNumber: "10A10" },
    ],
  },
  {
    id: "class-2",
    name: "Class 11-B",
    students: [
      { id: "student-11", name: "Mason Anderson", rollNumber: "11B01" },
      { id: "student-12", name: "Charlotte Thomas", rollNumber: "11B02" },
      { id: "student-13", name: "Logan Jackson", rollNumber: "11B03" },
      { id: "student-14", name: "Amelia White", rollNumber: "11B04" },
      { id: "student-15", name: "Elijah Harris", rollNumber: "11B05" },
      { id: "student-16", name: "Mia Martin", rollNumber: "11B06" },
      { id: "student-17", name: "James Thompson", rollNumber: "11B07" },
      { id: "student-18", name: "Harper Garcia", rollNumber: "11B08" },
      { id: "student-19", name: "Benjamin Martinez", rollNumber: "11B09" },
      { id: "student-20", name: "Evelyn Robinson", rollNumber: "11B10" },
    ],
  },
  {
    id: "class-3",
    name: "Class 12-C",
    students: [
      { id: "student-21", name: "Alexander Clark", rollNumber: "12C01" },
      { id: "student-22", name: "Abigail Rodriguez", rollNumber: "12C02" },
      { id: "student-23", name: "Michael Lewis", rollNumber: "12C03" },
      { id: "student-24", name: "Emily Lee", rollNumber: "12C04" },
      { id: "student-25", name: "William Walker", rollNumber: "12C05" },
      { id: "student-26", name: "Sofia Hall", rollNumber: "12C06" },
      { id: "student-27", name: "Daniel Allen", rollNumber: "12C07" },
      { id: "student-28", name: "Victoria Young", rollNumber: "12C08" },
      { id: "student-29", name: "Matthew King", rollNumber: "12C09" },
      { id: "student-30", name: "Scarlett Wright", rollNumber: "12C10" },
    ],
  },
];

// Mock subjects for teacher view
export const mockSubjects: Subject[] = [
  { id: "subject-1", name: "Mathematics", code: "MATH101", classId: "class-1" },
  { id: "subject-2", name: "Physics", code: "PHYS101", classId: "class-1" },
  { id: "subject-3", name: "Chemistry", code: "CHEM101", classId: "class-1" },
  {
    id: "subject-4",
    name: "Computer Science",
    code: "CS101",
    classId: "class-2",
  },
  { id: "subject-5", name: "English", code: "ENG101", classId: "class-2" },
  { id: "subject-6", name: "History", code: "HIST101", classId: "class-3" },
  { id: "subject-7", name: "Biology", code: "BIO101", classId: "class-3" },
  { id: "subject-8", name: "Geography", code: "GEO101", classId: "class-3" },
];

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Save,
  AlertCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
// import { mockClasses, mockSubjects } from "../utils/attendancedata";
import { Student, Class, Subject } from "../utils/types";
import { mockClasses, mockSubjects } from "@/utils/data";

export default function TeacherAttendancePage() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, "present" | "absent">
  >({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  // Filter subjects based on selected class
  const filteredSubjects = selectedClass
    ? mockSubjects.filter((subject) => subject.classId === selectedClass.id)
    : [];

  // Update filtered students when class changes or search query changes
  useEffect(() => {
    if (!selectedClass) {
      setFilteredStudents([]);
      return;
    }

    const filtered = selectedClass.students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredStudents(filtered);
  }, [selectedClass, searchQuery]);

  // Initialize attendance status for all students when class or subject changes
  useEffect(() => {
    if (selectedClass) {
      const initialStatus: Record<string, "present" | "absent"> = {};
      selectedClass.students.forEach((student) => {
        // Default all students to present
        initialStatus[student.id] = "present";
      });
      setAttendanceStatus(initialStatus);
    }
  }, [selectedClass, selectedSubject]);

  const handleStatusChange = (
    studentId: string,
    status: "present" | "absent"
  ) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: "present" | "absent") => {
    const newStatus: Record<string, "present" | "absent"> = {};
    filteredStudents.forEach((student) => {
      newStatus[student.id] = status;
    });
    setAttendanceStatus((prev) => ({
      ...prev,
      ...newStatus,
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClass || !selectedSubject) return;

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    }, 1500);
  };

  const getStatusColor = (status: "present" | "absent") => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: "present" | "absent") => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "absent":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Calculate attendance statistics
  const totalStudents = filteredStudents.length;
  const presentCount = Object.values(attendanceStatus).filter(
    (status) => status === "present"
  ).length;
  const absentCount = Object.values(attendanceStatus).filter(
    (status) => status === "absent"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto pt-24 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
              <p className="text-gray-600">
                Mark and manage student attendance
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={handleSaveAttendance}
                disabled={!selectedClass || !selectedSubject || isSaving}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${
                  !selectedClass || !selectedSubject
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          </div>

          {saveSuccess !== null && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center ${
                saveSuccess
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {saveSuccess ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span>
                {saveSuccess
                  ? "Attendance saved successfully!"
                  : "Failed to save attendance. Please try again."}
              </span>
            </div>
          )}

          {/* Class and Subject Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Select Class</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockClasses.map((classItem) => (
                  <button
                    key={classItem.id}
                    onClick={() => {
                      setSelectedClass(classItem);
                      setSelectedSubject(null);
                    }}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedClass?.id === classItem.id
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    <div className="font-medium">{classItem.name}</div>
                    <div className="text-sm text-gray-500">
                      {classItem.students.length} students
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Select Subject</h2>
              {selectedClass ? (
                filteredSubjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredSubjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedSubject?.id === subject.id
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                        }`}
                      >
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-gray-500">
                          {subject.code}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No subjects found for this class
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a class first
                </div>
              )}
            </div>
          </div>

          {/* Attendance Marking Section */}
          {selectedClass && selectedSubject && (
            <>
              {/* Attendance Statistics */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">
                  Attendance Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Total Students</div>
                    <div className="text-2xl font-bold">{totalStudents}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600">Present</div>
                    <div className="text-2xl font-bold text-green-700">
                      {presentCount}
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-red-600">Absent</div>
                    <div className="text-2xl font-bold text-red-700">
                      {absentCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student List and Attendance Marking */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-lg font-semibold mb-2 sm:mb-0">
                    {selectedClass.name} - {selectedSubject.name}
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleMarkAll("present")}
                      className="px-3 py-1 text-sm rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll("absent")}
                      className="px-3 py-1 text-sm rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Student List */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Roll No.
                        </th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="py-3 px-4 text-center font-medium text-gray-500 uppercase tracking-wider">
                          Attendance Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 whitespace-nowrap">
                              {student.rollNumber}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                                  {student.name.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <div className="font-medium">
                                    {student.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleStatusChange(student.id, "present")
                                  }
                                  className={`flex items-center px-3 py-1 rounded-full border ${
                                    attendanceStatus[student.id] === "present"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50"
                                  }`}
                                >
                                  <CheckCircle
                                    className={`w-4 h-4 mr-1 ${
                                      attendanceStatus[student.id] === "present"
                                        ? "text-green-500"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  Present
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(student.id, "absent")
                                  }
                                  className={`flex items-center px-3 py-1 rounded-full border ${
                                    attendanceStatus[student.id] === "absent"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-red-50"
                                  }`}
                                >
                                  <XCircle
                                    className={`w-4 h-4 mr-1 ${
                                      attendanceStatus[student.id] === "absent"
                                        ? "text-red-500"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-8 text-center text-gray-500"
                          >
                            {searchQuery
                              ? "No students match your search criteria"
                              : "No students found in this class"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Save Button (Bottom) */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveAttendance}
                    disabled={isSaving}
                    className="flex items-center justify-center px-6 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Attendance
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Instructions Card */}
          {!selectedClass && (
            <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">
                Instructions
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <span>
                    Select a class and subject to begin marking attendance
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <span>
                    Use the date picker to select the date for attendance
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <span>Mark students as Present, or Absent</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <span>
                    Use "Mark All" buttons to quickly set status for all
                    students
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <span>Click "Save Attendance" when you're done</span>
                </li>
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

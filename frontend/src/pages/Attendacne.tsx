import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, CheckCircle, X, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { AttendanceRecord, SubjectAttendance } from "../utils/types";
import { mockAttendanceData } from "@/utils/data";

export default function AttendancePage() {
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectAttendance | null>(null);

  // Calculate overall attendance
  const totalClasses = mockAttendanceData.reduce(
    (sum, subject) => sum + subject.totalClasses,
    0
  );
  const totalAttended = mockAttendanceData.reduce(
    (sum, subject) => sum + subject.attended,
    0
  );
  const overallPercentage =
    totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-500";
      case "absent":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto pt-24 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Attendance</h1>
          <p className="text-gray-600 mb-8">
            Track your attendance across all subjects
          </p>

          {/* Overall Attendance Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Overall Attendance
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">{totalAttended}</span> classes
                  attended out of{" "}
                  <span className="font-medium">{totalClasses}</span>
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-4xl font-bold ${getAttendanceColor(
                    overallPercentage
                  )}`}
                >
                  {overallPercentage.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-500">Academic Year 2025</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  overallPercentage >= 90
                    ? "bg-green-500"
                    : overallPercentage >= 75
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              ></div>
            </div>
          </div>

          {/* Subject-wise Attendance */}
          <h2 className="text-2xl font-semibold mb-4">
            Subject-wise Attendance
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockAttendanceData.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedSubject(subject)}
              >
                <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-gray-600">
                    <span className="font-medium">{subject.attended}</span>/
                    {subject.totalClasses} classes
                  </p>
                  <span
                    className={`text-xl font-bold ${getAttendanceColor(
                      subject.percentage
                    )}`}
                  >
                    {subject.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      subject.percentage >= 90
                        ? "bg-green-500"
                        : subject.percentage >= 75
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, subject.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance Tips */}
          <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-xl font-semibold mb-3 text-purple-700">
              Attendance Tips
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                <span>
                  Maintain at least 75% attendance to qualify for exams
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                <span>
                  Students with 90%+ attendance may receive merit points
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5" />
                <span>
                  Medical absences require proper documentation within 7 days
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Detailed Attendance Records Modal */}
      <AnimatePresence>
        {selectedSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {selectedSubject.name} - Detailed Records
                </h2>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSubject.records.map((record: AttendanceRecord) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(record.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getStatusIcon(record.status)}
                            <span
                              className={`ml-2 capitalize ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Attendance Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Present</p>
                    <p className="font-medium text-green-500">
                      {
                        selectedSubject.records.filter(
                          (r) => r.status === "present"
                        ).length
                      }{" "}
                      classes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Absent</p>
                    <p className="font-medium text-red-500">
                      {
                        selectedSubject.records.filter(
                          (r) => r.status === "absent"
                        ).length
                      }{" "}
                      classes
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

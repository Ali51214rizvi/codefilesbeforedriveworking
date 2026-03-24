import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./studentattendence.css";

interface AttendanceRecord {
  name: string;
  rollNo: string;
  subject: string;
  class: string;
  department: string;
  quizNumber: string;
  attendedAt: string;
}

function StudentAttendence() {

  const navigate = useNavigate();

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);

  const [subject, setSubject] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [department, setDepartment] = useState("");
  const [quizNumber, setQuizNumber] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("examAttendance") || "[]");
    setAttendanceData(stored);
  }, []);

  const handleFilter = () => {

    if (!subject || !studentClass || !department || !quizNumber) {
      alert("Please select all fields.");
      return;
    }

    const filtered = attendanceData.filter(
      (rec) =>
        rec.subject === subject &&
        rec.class === studentClass &&
        rec.department === department &&
        rec.quizNumber === quizNumber
    );

    setFilteredData(filtered);
  };

  return (
    <div className="attendance-wrapper">

      {/* NAVBAR */}
      <nav className="attendance-navbar">

        <button
        className="att-back-btn"
        onClick={() => navigate("/admindashboard")}
        >
        ⟵
        </button>

        <h2>Exam Attendance Management</h2>

      </nav>


      {/* FILTER PANEL */}

      <div className="attendance-filter-panel">

        <h3>Filter Students by Exam</h3>

        <div className="filter-grid">

          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Select Subject</option>
            <option value="Math">Math</option>
            <option value="Physics">Physics</option>
            <option value="Computer">Computer</option>
          </select>

          <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)}>
            <option value="">Select Class</option>
            <option value="10th">10th</option>
            <option value="11th">11th</option>
            <option value="12th">12th</option>
          </select>

          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">Select Department</option>
            <option value="Science">Science</option>
            <option value="Arts">Arts</option>
            <option value="Commerce">Commerce</option>
          </select>

          <input
          type="text"
          placeholder="Quiz Number"
          value={quizNumber}
          onChange={(e) => setQuizNumber(e.target.value)}
          />

          <button
          className="view-btn"
          onClick={handleFilter}
          >
          View Attendance
          </button>

        </div>

      </div>


      {/* ATTENDANCE TABLE */}

      <div className="attendance-table-container">

        <h3>Students Who Attempted This Quiz</h3>

        {filteredData.length === 0 ? (

          <div className="no-data">
            No students found for this exam.
          </div>

        ) : (

          <table className="attendance-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Department</th>
                <th>Quiz</th>
                <th>Attempt Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((student, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td>{student.subject}</td>
                  <td>{student.class}</td>
                  <td>{student.department}</td>
                  <td>{student.quizNumber}</td>
                  <td>{new Date(student.attendedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default StudentAttendence;
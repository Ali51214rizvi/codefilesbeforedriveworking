import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./checkmarks.css";

interface GradedSubmission {
  subject: string;
  class: string;
  department: string;
  rollNo: string;
  marks: number[];
  totalMarks: number;
  gradedAt: string;
  answers: string[];
}

function CheckMarks() {

  const navigate = useNavigate();
  const location = useLocation();

  const { subject, studentClass, department } = location.state || {};

  const [rollNo, setRollNo] = useState("");
  const [gradedData, setGradedData] = useState<GradedSubmission | null>(null);

  const handleSearch = () => {

    if (!rollNo.trim()) {
      alert("Please enter your roll number");
      return;
    }

    const key = `${subject}_${studentClass}_${department}_${rollNo}`;
    const grades = JSON.parse(localStorage.getItem("subjectiveGrades") || "{}");

    if (grades[key]) {
      setGradedData(grades[key]);
    } else {
      alert("No marks found for this student");
      setGradedData(null);
    }
  };

  return (

    <div className="checkmarks-page">

      {/* Navbar */}

      <nav className="checkmarks-navbar">

        <button
          className="cmback-btn"
          onClick={() => navigate("/studentdashboard")}
        >
          ⟵
        </button>

        <h2>Student Marks Portal</h2>

      </nav>



      <div className="checkmarks-container">

        <div className="exam-info-card">
          <h3>Exam Details</h3>
          <p><strong>Subject:</strong> {subject}</p>
          <p><strong>Class:</strong> {studentClass}</p>
          <p><strong>Department:</strong> {department}</p>
        </div>



        {/* Roll Number Search */}

        <div className="roll-search-card">

          <h3>Find Your Result</h3>

          <div className="roll-input-group">

            <input
              type="text"
              placeholder="Enter Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />

            <button onClick={handleSearch}>
              View Marks
            </button>

          </div>

        </div>



        {/* Result */}

        {gradedData && (

          <div className="marks-result-card">

            <h3>Result Summary</h3>

            <div className="result-meta">

              <p><strong>Roll No:</strong> {gradedData.rollNo}</p>
              <p><strong>Total Marks:</strong> {gradedData.totalMarks}</p>
              <p><strong>Checked At:</strong> {new Date(gradedData.gradedAt).toLocaleString()}</p>

            </div>



            <div className="answers-section">

              {gradedData.answers.map((ans, i) => (

                <div key={i} className="answer-card">

                  <h4>Question {i + 1}</h4>

                  <p className="answer-text">{ans}</p>

                  <div className="marks-box">
                    Marks: {gradedData.marks[i]}
                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default CheckMarks;
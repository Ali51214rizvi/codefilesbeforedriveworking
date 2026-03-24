import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./viewresult.css";

interface ResultData {
  subject: string;
  studentClass: string;
  department: string;
  rollNo: string;
  score: number;
  suspiciousWarnings: number;
  restrictedWarnings: number;
}

function ViewResult() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    subject: "",
    studentClass: "",
    department: "",
    rollNo: ""
  });

  const [results, setResults] = useState<ResultData[]>([]);
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null);

  useEffect(() => {

    const storedResults = JSON.parse(
      localStorage.getItem("examResults") || "[]"
    );

    setResults(storedResults);

  }, []);

  const handleSearch = () => {

    const found = results.find(
      (r) =>
        r.subject === filters.subject &&
        r.studentClass === filters.studentClass &&
        r.department === filters.department &&
        r.rollNo === filters.rollNo
    );

    if (!found) {
      alert("❌ No result found for this student.");
      setSelectedResult(null);
      return;
    }

    setSelectedResult(found);
  };

  return (
    <div className="vr-page">

      {/* Navbar */}

      <div className="vr-navbar">

        <button
          className="vr-back-btn"
          onClick={() => navigate("/admindashboard")}
        >
          ⟵
        </button>

        <h2>Student Result Analytics</h2>

      </div>

      {/* Filter Section */}

      <div className="vr-filter-box">

        <select
          value={filters.department}
          onChange={(e) =>
            setFilters({ ...filters, department: e.target.value })
          }
        >
          <option value="">Select Department</option>
          <option value="Science">Science</option>
          <option value="Arts">Arts</option>
          <option value="Commerce">Commerce</option>
        </select>

        <select
          value={filters.studentClass}
          onChange={(e) =>
            setFilters({ ...filters, studentClass: e.target.value })
          }
        >
          <option value="">Select Class</option>
          <option value="10th">10th</option>
          <option value="11th">11th</option>
          <option value="12th">12th</option>
        </select>

        <select
          value={filters.subject}
          onChange={(e) =>
            setFilters({ ...filters, subject: e.target.value })
          }
        >
          <option value="">Select Subject</option>
          <option value="Math">Math</option>
          <option value="Physics">Physics</option>
          <option value="Computer Science">Computer Science</option>
        </select>

        <input
          type="text"
          placeholder="Enter Roll Number"
          value={filters.rollNo}
          onChange={(e) =>
            setFilters({ ...filters, rollNo: e.target.value })
          }
        />

        <button
          className="vr-search-btn"
          onClick={handleSearch}
        >
          Search Result
        </button>

      </div>

      {/* Result Display */}

      {selectedResult && (

        <div className="vr-result-card">

          <h3>Student Performance</h3>

          <div className="vr-info">

            <p><strong>Roll No:</strong> {selectedResult.rollNo}</p>
            <p><strong>Subject:</strong> {selectedResult.subject}</p>
            <p><strong>Class:</strong> {selectedResult.studentClass}</p>
            <p><strong>Department:</strong> {selectedResult.department}</p>

          </div>

          {/* Score */}

          <div className="vr-score-box">

            <div className="vr-score">
              <h4>Score</h4>
              <p>{selectedResult.score}</p>
            </div>

            <div className="vr-warning suspicious">
              <h4>Suspicious Warnings</h4>
              <p>{selectedResult.suspiciousWarnings}</p>
            </div>

            <div className="vr-warning restricted">
              <h4>Restricted Warnings</h4>
              <p>{selectedResult.restrictedWarnings}</p>
            </div>

          </div>

          {/* Chart */}

          <div className="vr-chart">

            <ResponsiveContainer width="100%" height={250}>

              <BarChart
                data={[
                  {
                    name: "Score",
                    value: selectedResult.score
                  },
                  {
                    name: "Suspicious",
                    value: selectedResult.suspiciousWarnings
                  },
                  {
                    name: "Restricted",
                    value: selectedResult.restrictedWarnings
                  }
                ]}
              >

                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />

                <Bar dataKey="value" fill="#00c6ff" radius={[10,10,0,0]} />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      )}

    </div>
  );
}

export default ViewResult;
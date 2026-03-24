import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./subjective.css";

interface Question {
  question: string;
}

function Subjective() {

  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [department, setDepartment] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [quizNumber, setQuizNumber] = useState("");

  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  const [showReport, setShowReport] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    setQuestions([...questions, { question }]);
    setQuestion("");
  };


  const handleDone = () => {
    if (questions.length === 0 && !file) {
      alert("Add at least one question or upload a past paper");
      return;
    }

    setShowReport(true);
  };


  const handleUpload = () => {

    if (!subject || !studentClass || !department || !totalMarks || !totalTime || !quizNumber) {
      alert("Fill all exam details first");
      return;
    }

    const newExam = {
      type: "subjective",
      subject,
      studentClass,
      department,
      totalMarks,
      totalTime,
      quizNumber,
      questions,
      pastPaper: file ? URL.createObjectURL(file) : null
    };

    const exams = JSON.parse(localStorage.getItem("uploadedExams") || "[]");

    exams.push(newExam);

    localStorage.setItem("uploadedExams", JSON.stringify(exams));

    alert("Exam uploaded successfully!");

    navigate("/admindashboard");
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {

      const selectedFile = e.target.files[0];

      setFile(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(selectedFile));
      } else {
        setFilePreview(null);
      }
    }
  };


  return (

    <div className="subjective-container">

      {/* Navbar */}

      <nav className="subjective-navbar">

        <button
          className="subback-btn"
          onClick={() => navigate("/admindashboard")}
        >
          ⟵
        </button>

        <h2>Create Subjective Exam</h2>

      </nav>



      {!showReport ? (

        <form className="subjective-form" onSubmit={handleSubmit}>



          {/* Exam Information */}

          <div className="exam-section">

            <h3>Exam Information</h3>

            <div className="exam-grid">

              <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
                <option value="">Select Subject</option>
                <option value="Math">Math</option>
                <option value="Physics">Physics</option>
                <option value="Computer">Computer</option>
              </select>

              <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} required>
                <option value="">Select Class</option>
                <option value="10th">10th</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
              </select>

              <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                <option value="">Select Department</option>
                <option value="Science">Science</option>
                <option value="Arts">Arts</option>
                <option value="Commerce">Commerce</option>
              </select>

              <input
                type="number"
                placeholder="Total Marks"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
              />

              <input
                type="number"
                placeholder="Total Time (minutes)"
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
              />

              <input
                type="text"
                placeholder="Quiz Number"
                value={quizNumber}
                onChange={(e) => setQuizNumber(e.target.value)}
              />

            </div>

          </div>



          {/* Question Input */}

          <div className="question-section">

            <h3>Add Question</h3>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Write your question here..."
            />

          </div>



          {/* File Upload */}

          <div className="upload-section">

            <h3>Upload Past Paper (Optional)</h3>

            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />

            {filePreview && (

              <img
                src={filePreview}
                alt="preview"
                className="file-preview"
              />

            )}

          </div>



          {/* Buttons */}

          <div className="action-buttons">

            <button type="submit" className="add-btn">
              Add Question
            </button>

            <button type="button" onClick={handleDone} className="done-btn">
              Done
            </button>

          </div>

        </form>


      ) : (

        <div className="report-section">

          <h2>Exam Question Report</h2>

          <ul>

            {questions.map((q, i) => (

              <li key={i}>
                <strong>Q{i + 1}:</strong> {q.question}
              </li>

            ))}

            {file && questions.length === 0 && (

              <li>
                <strong>Uploaded File:</strong> {file.name}
              </li>

            )}

          </ul>

          <button
            className="upload-btn"
            onClick={handleUpload}
          >
            Upload Exam
          </button>

        </div>

      )}

    </div>
  );
}

export default Subjective;
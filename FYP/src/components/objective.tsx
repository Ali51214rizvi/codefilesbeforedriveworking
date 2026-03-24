import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./objective.css";

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}

function Objective() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const [subject, setSubject] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [department, setDepartment] = useState("");
  const [quizNumber, setQuizNumber] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [totalTime, setTotalTime] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addQuestion = () => {
    if (!question || options.includes("") || !correctAnswer) {
      alert("Please complete the question form.");
      return;
    }

    const newQuestion: MCQ = {
      question,
      options,
      correctAnswer: correctAnswer.toUpperCase(),
    };

    setQuestions([...questions, newQuestion]);

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
  };

  const finishQuestions = () => {
    if (questions.length === 0) {
      alert("Add at least one question.");
      return;
    }
    setShowPreview(true);
  };

  const uploadExam = () => {
    if (!subject || !studentClass || !department || !quizNumber) {
      alert("Fill exam details first.");
      return;
    }

    const exam = {
      type: "objective",
      subject,
      studentClass,
      department,
      quizNumber,
      totalMarks,
      totalTime,
      questions,
    };

    const allExams = JSON.parse(localStorage.getItem("uploadedExams") || "[]");

    allExams.push(exam);

    localStorage.setItem("uploadedExams", JSON.stringify(allExams));

    alert("✅ Exam Uploaded Successfully!");

    navigate("/admindashboard");
  };

  return (
    <div className="objective-page">

      {/* NAVBAR */}

      <div className="objective-navbar">
        <button className="obj-back-btn" onClick={() => navigate(-1)}>⟵</button>
        <h2>Create Objective Exam</h2>
      </div>

      <div className="objective-container">

        {!showPreview ? (

          <>

            {/* EXAM DETAILS */}

            <div className="exam-details-card">

              <h3>Exam Details</h3>

              <div className="exam-grid">

                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  <option>Math</option>
                  <option>Physics</option>
                  <option>Computer Science</option>
                </select>

                <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)}>
                  <option value="">Select Class</option>
                  <option>10th</option>
                  <option>11th</option>
                  <option>12th</option>
                </select>

                <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">Select Department</option>
                  <option>Science</option>
                  <option>Arts</option>
                  <option>Commerce</option>
                </select>

                <input
                  type="text"
                  placeholder="Quiz Number"
                  value={quizNumber}
                  onChange={(e) => setQuizNumber(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Total Marks"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Total Time (mins)"
                  value={totalTime}
                  onChange={(e) => setTotalTime(e.target.value)}
                />

              </div>

            </div>

            {/* QUESTION BUILDER */}

            <div className="question-card">

              <h3>Question Builder</h3>

              <textarea
                placeholder="Enter Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <div className="options-grid">

                {options.map((opt, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                ))}

              </div>

              <input
                type="text"
                placeholder="Correct Option (A/B/C/D)"
                maxLength={1}
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              />

              <div className="question-buttons">

                <button onClick={addQuestion} className="add-btn">
                  Add Question
                </button>

                <button onClick={finishQuestions} className="done-btn">
                  Preview Paper
                </button>

              </div>

              <p className="question-count">
                Total Questions Added: {questions.length}
              </p>

            </div>

          </>

        ) : (

          <div className="preview-card">

            <h2>Exam Preview</h2>

            {questions.map((q, i) => (
              <div key={i} className="preview-question">

                <p><strong>Q{i + 1}:</strong> {q.question}</p>

                <ul>
                  {q.options.map((op, j) => (
                    <li key={j}>{String.fromCharCode(65 + j)}: {op}</li>
                  ))}
                </ul>

                <p className="correct">Correct: {q.correctAnswer}</p>

              </div>
            ))}

            <button className="upload-btn" onClick={uploadExam}>
              Upload Exam
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default Objective;
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./startobjectiveexam.css";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Exam {
  type: string;
  subject: string;
  studentClass: string;
  department: string;
  totalMarks: number | string;
  totalTime: number | string;
  quizNumber: string;
  questions: Question[];
}

function StartObjectiveExam() {

  const navigate = useNavigate();
  const location = useLocation();
  const examState = location.state as Exam | undefined;

  const [examData, setExamData] = useState<Exam | null>(examState || null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);

  const [rollNo, setRollNo] = useState("");
  const [rollLocked, setRollLocked] = useState(false);

  /* TIMER STATE */

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!examState) {
      const uploaded = JSON.parse(localStorage.getItem("uploadedExams") || "[]");
      const fallback = uploaded.find((ex: Exam) => ex.type === "objective");
      if (fallback) setExamData(fallback);
      else navigate("/studentdashboard");
    }
  }, [examState, navigate]);



  /* START TIMER WHEN EXAM STARTS */

  useEffect(() => {

    if (!rollLocked || !examData) return;

    const totalSeconds = Number(examData.totalTime) * 60;

    setTimeLeft(totalSeconds);

  }, [rollLocked, examData]);



  /* COUNTDOWN TIMER */

  useEffect(() => {

    if (!rollLocked || submitted) return;

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          clearInterval(timer);

          alert("⏰ Time is over. Exam auto submitted.");

          autoSubmitExam(false);

          return 0;

        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [rollLocked, submitted]);



  const formatTime = (seconds: number) => {

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };



  /* TAB MONITORING */

/* TAB MONITORING */

useEffect(() => {

  let violationLock = false;

  const handleViolation = () => {

    if (violationLock) return;
    violationLock = true;

    setTabWarnings((prev) => {

      const count = prev + 1;

      if (count === 1) {
        alert("⚠️ Warning: Do not switch tabs.");
      } 
      else if (count === 2) {
        alert("⚠️ Final warning!");
      } 
      else if (count >= 3) {
        alert("❌ Exam ended due to multiple tab switches.");
        autoSubmitExam(true);
      }

      return count;
    });

    setTimeout(() => {
      violationLock = false;
    }, 1000);

  };

  const visibilityHandler = () => {
    if (document.hidden) handleViolation();
  };

  const blurHandler = () => handleViolation();

  document.addEventListener("visibilitychange", visibilityHandler);
  window.addEventListener("blur", blurHandler);

  return () => {
    document.removeEventListener("visibilitychange", visibilityHandler);
    window.removeEventListener("blur", blurHandler);
  };

}, [examData]);



  const selectAnswer = (qIndex: number, option: string) => {

    const updated = [...selectedAnswers];
    updated[qIndex] = option;
    setSelectedAnswers(updated);

  };



  const autoSubmitExam = (disqualified = false) => {

    if (!examData) return navigate("/studentdashboard");

    let totalScore = 0;

    const perMark = Number(examData.totalMarks) / examData.questions.length;

    examData.questions.forEach((q, i) => {

      const correctIndex = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;

      const correctOption = q.options[correctIndex];

      if (selectedAnswers[i] === correctOption) totalScore += perMark;

    });

    totalScore = Number(totalScore.toFixed(2));

    setScore(totalScore);

    setSubmitted(true);

    const attempted = JSON.parse(localStorage.getItem("attemptedExams") || "{}");

    const key =
      `${examData.type}_${examData.subject}_${examData.studentClass}_${examData.department}_${examData.quizNumber}_${rollNo}`;

    attempted[key] = { attempted: true, score: totalScore, disqualified };

    localStorage.setItem("attemptedExams", JSON.stringify(attempted));

    setTimeout(() => navigate("/studentdashboard"), 2500);

  };



  const handleSubmit = () => {

    if (!examData) return;

    if (!rollNo.trim()) {
      alert("Enter Roll Number first");
      return;
    }

    const allAnswered = examData.questions.every((_, i) => Boolean(selectedAnswers[i]));

    if (!allAnswered) {
      alert("Answer all questions before submitting");
      return;
    }

    autoSubmitExam(false);

  };



  if (!examData) {

    return (

      <div className="objexam-container">

        <h2>No exam found</h2>

        <button onClick={() => navigate("/studentdashboard")}>
          Back
        </button>

      </div>

    );

  }



  return (

    <div className="objexam-container">

      {/* NAVBAR */}

      <nav className="objexam-navbar">

        <button
          className="obj-back-btn"
          onClick={() => navigate("/examinstructions")}
        >
          ⟵
        </button>

        <h2>Online Objective Examination</h2>

      </nav>



      {/* EXAM HEADER */}

      <div className="objexam-header">

        <div className="exam-info">

          <h3>{examData.subject}</h3>

          <p>Class: {examData.studentClass}</p>
          <p>Department: {examData.department}</p>
          <p>Quiz: {examData.quizNumber}</p>

        </div>

        <div className="exam-meta">

          <p><strong>Total Marks:</strong> {examData.totalMarks}</p>

          <p><strong>Duration:</strong> {examData.totalTime} mins</p>

          {/* TIMER DISPLAY */}

          {rollLocked && (
            <p className="timer-box">
              ⏳ Time Left: {formatTime(timeLeft)}
            </p>
          )}

          <p className="warning-text">
            Tab Warnings: {tabWarnings} / 3
          </p>

        </div>

      </div>



      {/* ROLL NUMBER START */}

      {!rollLocked && (

        <div className="roll-section">

          <h3>Enter Roll Number to Start Exam</h3>

          <div className="roll-input-box">

            <input
              type="text"
              placeholder="Enter Roll Number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />

            <button
              onClick={() => {
                if (!rollNo.trim()) {
                  alert("Enter valid roll number");
                  return;
                }
                setRollLocked(true);
              }}
            >
              Start Exam
            </button>

          </div>

        </div>

      )}



      {/* QUESTIONS */}

      {rollLocked && !submitted && (

        <div className="questions-container">

          {examData.questions.map((q, i) => (

            <div key={i} className="question-card">

              <h4>Question {i + 1}</h4>

              <p className="question-text">{q.question}</p>

              <div className="options-grid">

                {q.options.map((opt, j) => (

                  <label
                    key={j}
                    className={`option-item ${selectedAnswers[i] === opt ? "selected" : ""}`}
                  >

                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={opt}
                      checked={selectedAnswers[i] === opt}
                      onChange={() => selectAnswer(i, opt)}
                    />

                    {String.fromCharCode(65 + j)}. {opt}

                  </label>

                ))}

              </div>

            </div>

          ))}

          <div className="submit-section">

            <button
              className="submit-exam-btn"
              onClick={handleSubmit}
            >
              Submit Exam
            </button>

          </div>

        </div>

      )}



      {/* RESULT */}

      {submitted && (

        <div className="result-card">

          <h2>Exam Submitted</h2>

          <p>Your Score</p>

          <h1>
            {score} / {examData.totalMarks}
          </h1>

          {tabWarnings >= 3 && (
            <p className="disqualified">
              Disqualified due to tab switching
            </p>
          )}

          <button
            onClick={() => navigate("/studentdashboard")}
          >
            Finish
          </button>

        </div>

      )}

    </div>

  );

}

export default StartObjectiveExam;
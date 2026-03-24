import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./examinstructions.css";

function ExamInstructions() {

  const navigate = useNavigate();
  const location = useLocation();
  const examInfo: any = location.state;

  const [error, setError] = useState("");
  const [latestExam, setLatestExam] = useState<any>(null);

  useEffect(() => {

    const allExams =
      JSON.parse(localStorage.getItem("uploadedExams") || "[]");

    if (!examInfo) return;

    const matchedExams = allExams.filter((exam: any) => {

      return (
        exam.subject === examInfo.subject &&
        exam.studentClass === examInfo.studentClass &&
        exam.department === examInfo.department
      );

    });

    if (matchedExams.length > 0) {

      const latest = matchedExams.sort(
        (a: any, b: any) => b.createdAt - a.createdAt
      )[0];

      setLatestExam(latest);

    }

  }, [examInfo]);


  const handleStartExam = () => {

    if (!latestExam) return;

    const attemptedExams =
      JSON.parse(localStorage.getItem("attemptedExams") || "{}");

    const examKey =
      `${latestExam.type}_${latestExam.subject}_${latestExam.studentClass}_${latestExam.department}_${latestExam.quizNumber}`;

    if (attemptedExams[examKey]) {

      setError("You have already attempted this exam.");
      return;

    }

    attemptedExams[examKey] = true;

    localStorage.setItem(
      "attemptedExams",
      JSON.stringify(attemptedExams)
    );


    fetch("http://127.0.0.1:5000/start-camera")
      .then((res) => res.json())
      .then((data) => console.log("Camera started:", data))
      .catch(() => console.log("Camera server not running"));


    if (latestExam.type === "objective") {

      navigate("/startobjectiveexam", { state: latestExam });

    } else if (latestExam.type === "subjective") {

      navigate("/startsubjectiveexam", { state: latestExam });

    } else {

      setError("Unknown exam type uploaded.");

    }

  };


  return (

    <div className="examinst-wrapper">

      <nav className="examinst-navbar">

        <button
          className="examinst-back-btn"
          onClick={() => navigate("/studentdashboard")}
        >
          ←
        </button>

        <h2>Exam Instructions</h2>

      </nav>


      <div className="examinst-container">

        <div className="examinst-card">

          <h1>Before You Begin</h1>

          <p className="examinst-subtitle">
            Please read the following instructions carefully before starting the exam.
          </p>


          <div className="examinst-info">

            <div>
              <span>Subject</span>
              <p>{examInfo?.subject}</p>
            </div>

            <div>
              <span>Class</span>
              <p>{examInfo?.studentClass}</p>
            </div>

            <div>
              <span>Department</span>
              <p>{examInfo?.department}</p>
            </div>

          </div>


          <div className="examinst-rules">

            <h3>Exam Rules</h3>

            <ul>
              <li>Ensure a stable internet connection.</li>
              <li>Do not refresh or close the browser.</li>
              <li>Switching tabs will trigger cheating detection.</li>
              <li>No copy paste is allowed during the exam.</li>
              <li>Multiple faces detected will terminate the exam.</li>
              <li>Camera monitoring will remain active.</li>
            </ul>

          </div>


          <button
            className={`examinst-start-btn ${!latestExam ? "disabled" : ""}`}
            onClick={handleStartExam}
            disabled={!latestExam}
          >
            {latestExam ? "Start Exam" : "No Exam Uploaded Yet"}
          </button>


          {error && <p className="examinst-error">{error}</p>}

        </div>

      </div>

    </div>

  );

}

export default ExamInstructions;
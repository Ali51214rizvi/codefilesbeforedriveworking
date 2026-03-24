import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './startsubjectiveexam.css';

interface Question {
  question: string;
  marks?: number;
}

interface Exam {
  type: string;
  subject: string;
  studentClass: string;
  department: string;
  totalMarks: number;
  totalTime: number;
  quizNumber: string;
  questions: Question[];
  pastPaper?: string;
}

function StartSubjectiveExam() {

  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state as Exam | undefined;

  const [answers, setAnswers] = useState<string[]>([]);
  const [focusWarnings, setFocusWarnings] = useState(0);
  const [rollNo, setRollNo] = useState('');
  const [rollLocked, setRollLocked] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!exam) navigate('/studentdashboard');
  }, [exam, navigate]);

  /* START TIMER WHEN EXAM STARTS */

  useEffect(() => {

    if (!timerActive || !exam) return;

    if (timeLeft <= 0) {
      alert("⏰ Time finished. Exam auto submitted.");
      autoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [timerActive, timeLeft]);



  /* TAB SWITCH DETECTION */

  useEffect(() => {

    if (!exam) return;

    const handleVisibilityChange = () => {

      if (document.hidden) {

        setFocusWarnings(prev => {

          const newCount = prev + 1;

          if (newCount >= 3) {

            alert('❌ Exam terminated due to switching tabs/minimizing.');
            autoSubmit();

          } else {

            alert(`⚠️ Warning ${newCount}/3: Do not switch tabs or minimize!`);

          }

          return newCount;

        });

      }

    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      alert('🚫 Pasting is not allowed during the exam.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('paste', handlePaste);
    };

  }, [exam]);



  const handleAnswerChange = (index: number, value: string) => {

    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

  };



  const autoSubmit = () => {

    if (!exam) return;

    const submissionKey =
      `${exam.subject}_${exam.studentClass}_${exam.department}_${rollNo}`;

    const submissionData = {
      subject: exam.subject,
      class: exam.studentClass,
      department: exam.department,
      rollNo,
      answers,
      quizNumber: exam.quizNumber,
      submittedAt: new Date().toISOString(),
    };

    const existingSubmissions =
      JSON.parse(localStorage.getItem('subjectiveSubmissions') || '{}');

    existingSubmissions[submissionKey] = submissionData;

    localStorage.setItem(
      'subjectiveSubmissions',
      JSON.stringify(existingSubmissions)
    );

    navigate('/studentdashboard');

  };



  const handleSubmit = () => {

    if (!exam) return;

    if (!rollNo.trim()) {
      alert('⚠️ Please enter your Roll No.');
      return;
    }

    if (!exam.questions.every((_, i) => answers[i]?.trim())) {
      alert('⚠️ Please answer all questions before submitting.');
      return;
    }

    alert('✅ Exam submitted successfully!');

    autoSubmit();

  };



  if (!exam) {

    return (

      <div className="subjexam-wrapper">

        <h2>No exam data found. Return to dashboard.</h2>

        <button
        onClick={() => navigate('/studentdashboard')}
        className="subjexam-backbtn"
        >
        Go Back
        </button>

      </div>

    );

  }



  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;



  return (

    <div className="subjexam-wrapper">

      {/* NAVBAR */}

      <div className="subjexam-navbar">

        <button
        onClick={() => navigate('/examinstructions')}
        className="subjexam-nav-back"
        >
        ⟵
        </button>

        <h2 className="subjexam-title">
          Subjective Exam
        </h2>

      </div>



      {/* EXAM INFO */}

      <div className="subjexam-info">

        <h3>
          {exam.subject} — {exam.studentClass} — {exam.department}
        </h3>

        <p>Total Marks: {exam.totalMarks}</p>
        <p>Duration: {exam.totalTime} mins</p>
        <p>Quiz No: {exam.quizNumber}</p>

        {rollLocked && (
          <p className="timer-text">
            ⏳ Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        )}



        {/* ROLL INPUT */}

        {!rollLocked && (

          <div className="rollno-input">

            <label>Enter Roll No:</label>

            <input
            type="text"
            placeholder="Enter here..."
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
              setTimeLeft(exam.totalTime * 60);
              setTimerActive(true);

            }}
            >
            Start Exam
            </button>

          </div>

        )}

      </div>



      {/* PAST PAPER */}

      {exam.pastPaper && rollLocked && (

        <div className="subjexam-pastpaper">

          <h4>Question Paper</h4>

          <img
          src={exam.pastPaper}
          alt="Past Paper"
          />

        </div>

      )}



      {/* ANSWERS */}

      {rollLocked && (

        <div className="subjexam-answers-section">

          <h4>Write your answers below:</h4>

          <form
          className="subjexam-form"
          onSubmit={(e) => e.preventDefault()}
          >

            {exam.questions.map((q, index) => (

              <div
              key={index}
              className="subjexam-question"
              >

                <h5>
                  Q{index + 1}. {q.question}
                </h5>

                <textarea
                placeholder="Type your answer here..."
                value={answers[index] || ''}
                onChange={(e) =>
                  handleAnswerChange(index, e.target.value)
                }
                rows={6}
                className="subjexam-textarea"
                />

              </div>

            ))}



            <button
            type="button"
            onClick={handleSubmit}
            className="subjexam-submit-btn"
            >
            Submit Exam
            </button>

          </form>

        </div>

      )}

      <span style={{ display: 'none' }}>
        {focusWarnings}
      </span>

    </div>

  );

}

export default StartSubjectiveExam;
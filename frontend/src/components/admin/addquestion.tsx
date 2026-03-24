import { useNavigate } from "react-router-dom";
import "./addquestion.css";

function AddQuestion() {
  const navigate = useNavigate();

  return (
    <div className="aq-wrapper">

      {/* Top Navbar */}
      <nav className="aq-navbar">

        <button
          className="aq_back_btn"
          onClick={() => navigate(-1)}
        >
          ⟵
        </button>

        <h2>Exam Management</h2>

      </nav>

      {/* Header Section */}

      <div className="aq-header">

        <h1>Create New Exam</h1>

        <p>
          Choose the type of questions you want to create for the exam.
          Objective questions are automatically graded while subjective
          questions require manual evaluation.
        </p>

      </div>

      {/* Exam Type Cards */}

      <div className="aq-cards">

        {/* Objective Card */}

        <div
          className="aq-card"
          onClick={() => navigate("/objective")}
        >

          <div className="aq-icon">🎯</div>

          <h3>Objective Exam</h3>

          <p>
            Multiple choice questions with automatic scoring.
          </p>

          <button className="aq-card-btn">
            Create Objective Exam
          </button>

        </div>

        {/* Subjective Card */}

        <div
          className="aq-card"
          onClick={() => navigate("/subjective")}
        >

          <div className="aq-icon">📝</div>

          <h3>Subjective Exam</h3>

          <p>
            Descriptive or essay questions requiring manual
            evaluation by the instructor.
          </p>

          <button className="aq-card-btn">
            Create Subjective Exam
          </button>

        </div>

      </div>

    </div>
  );
}

export default AddQuestion;
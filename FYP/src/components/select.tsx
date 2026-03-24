import { useNavigate } from "react-router-dom";
import "./select.css";

export default function Select() {
  const navigate = useNavigate();

  return (
    <div className="frame-wrapper">

      {/* Borders */}
      <div className="border top"></div>
      <div className="border bottom">
        <p className="footer-note">
          AI Powered Online Exam Cheating Detection System
        </p>
      </div>
      <div className="border left"></div>
      <div className="border right"></div>

      {/* HERO SECTION */}
      <div className="center-container">

        <div className="left-section">
          <h1 className="main-heading">
            Secure Online Examination Platform
          </h1>

          <p className="description">
            Monitor and prevent cheating during online examinations using
            advanced AI technologies including face detection, tab monitoring,
            and behavior analysis.
          </p>
        </div>

        <div className="right-section">
          <div className="card">
            <h2>Get Started</h2>
            <p>Select an option to continue</p>

            <button
              className="action-btn login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="action-btn signup-btn"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
          </div>
        </div>

      </div>


      {/* FEATURES SECTION */}
      <section className="features-section">

        <h2 className="section-title">AI Monitoring Features</h2>

        <div className="features-grid">

          <div className="feature-card">
            <h3>Face Detection</h3>
            <p>Ensures only the registered student is present during the exam.</p>
          </div>

          <div className="feature-card">
            <h3>Multiple Face Detection</h3>
            <p>Detects if more than one person appears in front of the camera.</p>
          </div>

          <div className="feature-card">
            <h3>Tab Switching Detection</h3>
            <p>Monitors if the student switches browser tabs during the exam.</p>
          </div>

          <div className="feature-card">
            <h3>Behavior Monitoring</h3>
            <p>Tracks suspicious movements and exam behavior.</p>
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="workflow-section">

        <h2 className="section-title">How The System Works</h2>

        <div className="workflow-grid">

          <div className="workflow-step">
            <h3>1. Admin Uploads Exam</h3>
            <p>Admin uploads question paper for a specific department and course.</p>
          </div>

          <div className="workflow-step">
            <h3>2. Student Login</h3>
            <p>Students login and select department, class and course.</p>
          </div>

          <div className="workflow-step">
            <h3>3. Start Secure Exam</h3>
            <p>AI monitoring starts immediately when the exam begins.</p>
          </div>

        </div>

      </section>


      {/* SECURITY SECTION */}

      <section className="security-section">

        <h2 className="section-title">Why Our System Is Secure</h2>

        <p className="security-text">
          Our AI-powered system ensures academic integrity by monitoring
          student behavior, detecting suspicious activity, and generating
          reports for administrators. The system prevents cheating and
          ensures fair examination environments.
        </p>

      </section>


      {/* FOOTER */}

      <footer className="main-footer">
        <p>© 2026 AI Exam Proctoring System</p>
      </footer>

    </div>
  );
}
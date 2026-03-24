import { useNavigate } from "react-router-dom";
import "./admindashboard.css";
import {
  FaPlusCircle,
  FaChartLine,
  FaClipboardCheck,
  FaUserCheck,
} from "react-icons/fa";

function AdminDashboard() {

  const navigate = useNavigate();
  
    const handleLogout = ()=>{
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="admindash-wrapper">

      {/* Top Navbar */}

      <nav className="admindash-navbar">

        <button
          className="adb_back_btn"
          onClick={() => navigate("/login")}
        >
          ←
        </button>

        <h2>ProctorAI Admin Panel</h2>
        <div className="adb-nav-right">
          <button className="adb-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>


      <div className="admindash-main">

        {/* LEFT SIDEBAR */}

        <aside className="admindash-sidebar">

          <h3 className="sidebar-title">Admin Menu</h3>

          <button
            className="sidebar-btn"
            onClick={() => navigate("/addquestion")}
          >
            <FaPlusCircle /> Add Question
          </button>

          <button
            className="sidebar-btn"
            onClick={() => navigate("/viewresult")}
          >
            <FaChartLine /> View Student Score
          </button>

          <button
            className="sidebar-btn"
            onClick={() => navigate("/checkexam")}
          >
            <FaClipboardCheck /> Check Exam
          </button>

          <button
            className="sidebar-btn"
            onClick={() => navigate("/studentattendence")}
          >
            <FaUserCheck /> Student Attendance
          </button>

        </aside>


        {/* CENTER DASHBOARD */}

        <section className="admindash-content">

          <h1>Welcome Admin</h1>

          <p className="admindash-subtitle">
            Manage exams, monitor students and analyze results from this dashboard.
          </p>

    


          {/* Admin Info Section */}

          <div className="admin-info-box">

            <h3>Admin Instructions</h3>

            <ul>
              <li>Add questions before exam time.</li>
              <li>Monitor exams to detect cheating.</li>
              <li>Review student performance after exams.</li>
              <li>Check attendance reports for each class.</li>
            </ul>

          </div>

        </section>

      </div>

      {/* Footer */}

      <footer className="admindash-footer">
        AI Powered Online Exam Cheating Detection System
      </footer>

    </div>
  );
}

export default AdminDashboard;

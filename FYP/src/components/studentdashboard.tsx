import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./studentdashboard.css";

function StudentDashboard() {

  const navigate = useNavigate();

  const [subject,setSubject] = useState("");
  const [studentClass,setStudentClass] = useState("");
  const [department,setDepartment] = useState("");

  const handleStartExam = (e:React.FormEvent)=>{
    e.preventDefault();

    if(!subject || !studentClass || !department){
      alert("Please select all fields.");
      return;
    }

    navigate("/examinstructions",{
      state:{subject,studentClass,department}
    });
  };

  const handleCheckMarks = ()=>{
    if(!subject || !studentClass || !department){
      alert("Please select subject, class and department.");
      return;
    }

    navigate("/checkmarks",{
      state:{subject,studentClass,department}
    });
  };

  const handleLogout = ()=>{
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return(

    <div className="sdb-page">

      {/* Back Button */}
      <button
        className="sdb-back-btn"
        onClick={()=>navigate("/")}
      >
        ←
      </button>

      {/* NAVBAR */}

      <nav className="sdb-navbar">

        <div className="sdb-logo">
          🎓 ProctorAI
        </div>

        <div className="sdb-nav-right">
          <button className="sdb-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>


      {/* HERO SECTION */}

      <div className="sdb-hero">

        <h1>Welcome Student</h1>

        <p>
          Start your secure AI-monitored examination by selecting
          your subject, class and department.
        </p>

      </div>


      {/* MAIN DASHBOARD */}

      <div className="sdb-main">

        {/* Exam Card */}

        <div className="sdb-card">

          <h2>Start Examination</h2>

          <form onSubmit={handleStartExam}>

            <label>Subject</label>
            <select
              value={subject}
              onChange={(e)=>setSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
              <option value="Computer Science">Computer Science</option>
            </select>


            <label>Class</label>
            <select
              value={studentClass}
              onChange={(e)=>setStudentClass(e.target.value)}
            >
              <option value="">Select Class</option>
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </select>


            <label>Department</label>
            <select
              value={department}
              onChange={(e)=>setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
              <option value="Commerce">Commerce</option>
            </select>


            <div className="sdb-btns">

              <button
                type="submit"
                className="sdb-start-btn"
              >
                Start Exam
              </button>

              <button
                type="button"
                onClick={handleCheckMarks}
                className="sdb-marks-btn"
              >
                Check Marks
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default StudentDashboard;
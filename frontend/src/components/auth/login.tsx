import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {

      /* ---------------- BACKEND / DATABASE CODE (DISABLED) ----------------

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      if (data.role === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/studentdashboard");
      }

      ---------------------------------------------------------------------- */

      // TEMPORARY LOGIN LOGIC FOR FRONTEND TESTING

      if(email.includes("admin")){
        alert("Admin login successful (demo mode)");
        navigate("/studentashboard");
      }
      else{
        alert("Student login successful (demo mode)");
        navigate("/admindashboard");
      }

    } catch (error) {
      alert("Server disabled. Running frontend demo.");
    }
  };

  return (

    <div className="login-page">

      {/* Back Button */}
      <button
        className="login-back-btn"
        onClick={() => navigate("/")}
      >
        ←
      </button>

      <div className="login-container">

        <div className="login-left">
          <h1>Secure Exam Portal</h1>

          <p>
            Login to access the AI-powered online examination system.
            Your activities during the exam will be monitored to ensure
            a fair and secure testing environment.
          </p>
        </div>

        <div className="login-right">

          <form className="login-card" onSubmit={handleLogin}>

            <h2>Login</h2>
            <p>Enter your credentials</p>

            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button type="submit" className="login-btn">
              Login
            </button>

            <span className="signup-link">
              Don't have an account?
              <span onClick={()=>navigate("/signup")}>
                Signup
              </span>
            </span>

          </form>

        </div>

      </div>

    </div>
  );
}

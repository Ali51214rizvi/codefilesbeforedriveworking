import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";

export default function Signup() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [role,setRole] = useState("student");

  const handleSignup = async (e:any)=>{
    e.preventDefault();

    try{

      /* ---------------- DATABASE / SERVER CODE (DISABLED) ----------------

      const response = await fetch("http://localhost:5000/signup",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          name,
          email,
          password,
          role
        })
      });

      const data = await response.json();

      if(!response.ok){
        alert(data.message);
        return;
      }

      --------------------------------------------------------------------- */

      // TEMPORARY FRONTEND-ONLY SUCCESS
      alert("Signup successful (frontend demo mode).");

      // Navigate to login page
      navigate("/login");

    }
    catch(error){
      alert("Server disabled for now.");
    }

  }

  return (

    <div className="signup-page">

      {/* Back Button */}
      <button
        className="signup-back-btn"
        onClick={()=>navigate("/")}
      >
        ←
      </button>

      <div className="signup-container">

        <div className="signup-left">

          <h1>Create Account</h1>

          <p>
            Register to access the AI-powered online examination system.
            Choose your role and create your account securely.
          </p>

        </div>


        <div className="signup-right">

          <form className="signup-card" onSubmit={handleSignup}>

            <h2>Signup</h2>
            <p>Enter your details</p>

            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e)=>setName(e.target.value)}
            />

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

            {/* Role Selection */}
            <select
              value={role}
              onChange={(e)=>setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="signup-btn">
              Create Account
            </button>

            <span className="login-link">
              Already have an account?
              <span onClick={()=>navigate("/login")}>
                Login
              </span>
            </span>

          </form>

        </div>

      </div>

    </div>

  )

}
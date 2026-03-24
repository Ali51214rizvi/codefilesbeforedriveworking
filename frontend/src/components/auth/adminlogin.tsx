import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './adminlogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const storedData = localStorage.getItem(`admin_${email}`);
    if (!storedData) {
      alert('Admin account not found!');
      return;
    }
    const admin = JSON.parse(storedData);

    if (password === admin.password) {
      alert('Login successful!');
      navigate('/admindashboard');
    } else {
      alert('Invalid email or password!');
    }
  };

  const handleForgotPassword = () => {
    const emailPrompt = prompt('Enter your admin email to retrieve password:');
    if (!emailPrompt) return;

    const storedData = localStorage.getItem(`admin_${emailPrompt}`);
    if (!storedData) {
      alert('Admin account not found!');
      return;
    }

    const admin = JSON.parse(storedData);
    alert(`Your password is: ${admin.password}`);
  };

  return (
    <div className="adminlogin-wrapper">
      <nav className="adminlogin-navbar">
        <div className="adminlogin-navbar-back">
          <Link to="/login"><button>⟵</button></Link>
        </div>
        <h2>Admin Login Portal</h2>
      </nav>

      <div className="adminlogin-section">
        <div className="adminlogin-box">
          <form className="adminlogin-form" onSubmit={handleLogin}>
            <h2>
              Email:
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </h2>

            <h2>
              Password:
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </h2>

            <button type="submit">Login</button>
          </form>
          {/* Forgot password link */}
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <button
              type="button"
              className="forgot-password-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

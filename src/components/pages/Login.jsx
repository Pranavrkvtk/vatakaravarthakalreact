import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";   // ← import the CSS

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Remember me
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUser");
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { username, password }
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      if (rememberMe) {
        localStorage.setItem("rememberedUser", username);
      } else {
        localStorage.removeItem("rememberedUser");
      }
      if (response.data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="login-title">Admin Login</h2>
          <p className="login-subtitle">Sign in to dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot?</a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="login-footer">
            No account? <a href="#">Contact Admin</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";

// Optional: import your configured axios instance
// import api from '../api/axiosConfig';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

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
      // Use a configured axios instance (or plain axios with full URL)
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000, // 10 seconds
        }
      );

      // Log the full response for debugging (remove in production)
      console.log("✅ Login success:", response.data);

      const { token, role } = response.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      // Store tokens
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (rememberMe) {
        localStorage.setItem("rememberedUser", username);
      } else {
        localStorage.removeItem("rememberedUser");
      }

      // Redirect based on role
      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Login error:", err);

      let errorMessage = "Invalid credentials. Please try again.";

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out – server may be slow.";
      } else if (err.response) {
        // Server responded with a status other than 2xx
        errorMessage = err.response.data?.message || err.response.statusText || "Server error.";
      } else if (err.request) {
        // No response from server (network / CORS)
        errorMessage = "Network error – cannot reach the server. Check if backend is running.";
      }

      setError(errorMessage);
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
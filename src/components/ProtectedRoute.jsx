// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- ADD THIS

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // 1. If no token at all, kick to login
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    
    // 2. Check if token is expired OR if the role is not ADMIN
    // (Note: depending on your Spring Boot config, it might be "ADMIN" or "ROLE_ADMIN")
    if (decoded.exp * 1000 < Date.now() || (decoded.role !== 'ADMIN' && decoded.role !== 'ROLE_ADMIN')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // 3. If the token is malformed/corrupted, kick to login
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  // If we get here, the token is valid and belongs to an Admin
  return children;
};

export default ProtectedRoute;
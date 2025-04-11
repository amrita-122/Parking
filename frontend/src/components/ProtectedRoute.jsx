import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const ProtectedRoute = ({ children, adminOnly = false }) => {
 
  const [isAuthorized, setIsAuthorized] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("token");
        setIsAuthorized(false);
      } else if (adminOnly && decoded.role !== "admin") {
        setIsAuthorized("unauthorized");
      } else {
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error("Token error:", err);
      setIsAuthorized(false);
    }
  }, [token, adminOnly]);

  if (isAuthorized === null) return <p>Loading...</p>;

  if (isAuthorized === false) return <Navigate to="/signin" />;
  if (isAuthorized === "unauthorized") return <Navigate to="/" />;
  return children;
};

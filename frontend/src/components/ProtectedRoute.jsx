import {Navigate} from "react-router-dom";
export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token; // Returns true if token exists, false otherwise
  }

export const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/signin" />;
    }
    return children;
  };
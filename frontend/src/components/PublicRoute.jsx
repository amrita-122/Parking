import { Navigate } from "react-router-dom";
  const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // Returns true if token exists, false otherwise
};
export const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" />;
  }
  return children;
};
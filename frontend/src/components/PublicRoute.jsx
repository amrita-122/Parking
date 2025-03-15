import { Navigate } from "react-router-dom";
import { isAuthenticated } from "./ProtectedRoute";

export const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" />;
  }
  return children;
};
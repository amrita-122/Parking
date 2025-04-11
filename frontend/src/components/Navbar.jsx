import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";

export const Navbar =() =>{
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.email?.split("@")[0] || "User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const navItemClass = ({ isActive }) =>
    `px-4 py-2 rounded-md font-medium ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white shadow-md flex justify-between items-center px-4 py-2 sticky top-0 z-50">
      <div className="flex gap-4">
        <NavLink to="/" className={navItemClass}>
          Map
        </NavLink>
        <NavLink to="/reserve" className={navItemClass}>
          Reserve
        </NavLink>
        <NavLink to="/check" className={navItemClass}>
          Check-In
        </NavLink>
        <NavLink to="/history" className={navItemClass}>
          History
        </NavLink>
        <NavLink to="/settings" className={navItemClass}>
          Settings
        </NavLink>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-800">
          👤 {userName}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

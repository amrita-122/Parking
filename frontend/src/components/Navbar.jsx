// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";

export const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="flex justify-around">
        <div className="text-l font-bold flex items-center w-[60%]">
        Smart Parking System</div>
        <div className="flex justify-end gap-2">

        <Button
          label="Logout"
          onClick={handleLogout}
        />
         <Button
          label="Logout"
          onClick={handleLogout}
        />
         <Button
          label="Logout"
          onClick={handleLogout}
        />
         <Button
          label="Logout"
          onClick={handleLogout}
        />
         <Button
          label="Logout"
          onClick={handleLogout}
        /> <Button
          label="Logout"
          onClick={handleLogout}
        />
        </div>

      </div>
    </nav>
  );
};
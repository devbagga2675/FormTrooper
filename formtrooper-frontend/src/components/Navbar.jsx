import React from "react";
import { UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/formtrooper-logo.png";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <nav className="bg-white text-black p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <img src={logo} style={{ height: "48px", width: "auto" }} />

        {/* Profile and Logout */}
        <div className="flex items-center gap-4">
          <UserCircle className="h-6 w-6" strokeWidth={1.5} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

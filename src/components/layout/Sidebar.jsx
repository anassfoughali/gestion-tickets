import React from "react";
import { FiHome, FiList, FiUsers, FiBarChart2, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: <FiHome size={20} />, label: "Dashboard", active: true },
  { icon: <FiList size={20} />, label: "Tickets" },
  { icon: <FiUsers size={20} />, label: "Techniciens" },
  { icon: <FiBarChart2 size={20} />, label: "Rapports" },
  { icon: <FiSettings size={20} />, label: "Paramètres" },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex flex-col min-h-screen text-white bg-indigo-800 w-60">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-indigo-700">
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
          <span className="text-lg font-bold text-indigo-700">FG</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Finatech group</p>
          <p className="text-xs text-indigo-300">Support Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              transition-colors duration-150 ${
                item.active
                  ? "bg-white text-indigo-700"
                  : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-indigo-200 transition-colors duration-150 rounded-lg hover:bg-red-600 hover:text-white"
        >
          <FiLogOut size={20} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
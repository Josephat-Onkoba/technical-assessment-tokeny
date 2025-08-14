import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaUserCircle, FaTasks } from "react-icons/fa";
import TaskList from "../tasks/TaskList";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hideProfileRoutes = ["/", "/login", "/signup"]; // legacy paths
  const isAuthenticated = !!localStorage.getItem("token");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [taskListOpen, setTaskListOpen] = useState(false);
  const dropdownRef = useRef(null);
  const taskListRef = useRef(null);
  const [profile, setProfile] = useState({ name: "User", profilePic: "", role: "user" });

  useEffect(() => {
    // Check if user is in admin or user portal
    const isAdminPortal = location.pathname.startsWith("/admin");

    // Load correct profile from localStorage
    const storedProfile = JSON.parse(localStorage.getItem(isAdminPortal ? "adminProfile" : "userProfile"));
    
    if (storedProfile) {
      setProfile({
        name: storedProfile.name || "User",
        profilePic: storedProfile.profilePic || "",
        role: storedProfile.role || (isAdminPortal ? "admin" : "user"), // Ensure role is set
      });
    }
  }, [location.pathname]); // Re-run when path changes

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (taskListRef.current && !taskListRef.current.contains(event.target)) {
        setTaskListOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      const isAdminPortal = location.pathname.startsWith("/admin");

      // Remove the correct profile from storage
      localStorage.removeItem(isAdminPortal ? "adminProfile" : "userProfile");

      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();

    setTimeout(() => {
      const isAdminPortal = location.pathname.startsWith("/admin");

      if (isAdminPortal) {
        if (location.pathname === "/admin/dashboard") {
          window.location.reload(); // Refresh if already on admin dashboard
        } else {
          navigate("/admin/dashboard"); // Redirect to admin dashboard
        }
      } else {
        if (location.pathname === "/user/dashboard") {
          window.location.reload(); // Refresh if already on user dashboard
        } else {
          navigate("/user/dashboard"); // Redirect to user dashboard
        }
      }
    }, 500);
  };

  return (
    <nav className="bg-blue-600 text-white px-5 py-4 flex justify-between items-center shadow-lg">
      {/* Logo with Image & Text */}
      <Link
        to="/"
        onClick={handleLogoClick}
        className="flex items-center text-3xl font-bold tracking-wide hover:opacity-70 transition"
      >
        <img src="/app_icon.png" alt="TaskFlow Logo" className="w-12 h-12 rounded-full mr-2" />
        TaskFlow
      </Link>

      <div className="flex items-center gap-4">
        {/* Task List Button (Hidden on Landing/Login/Signup) */}
  {isAuthenticated && !hideProfileRoutes.includes(location.pathname) && (
          <div className="relative" ref={taskListRef}>
            <button
              onClick={() => setTaskListOpen(!taskListOpen)}
              className="flex items-center bg-white text-blue-600 font-medium px-4 py-2 rounded-lg shadow-md 
                         hover:bg-blue-700 hover:text-white transition-all focus:outline-none mr-2"
            >
              <FaTasks className="text-xl mr-2" />
              <span>Tasks</span>
            </button>

            {/* Task List Dropdown */}
            {taskListOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-10">
                <TaskList />
              </div>
            )}
          </div>
        )}

        {/* Profile Button (Hidden on Landing/Login/Signup) */}
  {isAuthenticated && !hideProfileRoutes.includes(location.pathname) && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center bg-white text-blue-600 font-medium px-4 py-2 rounded-lg shadow-md 
                         hover:bg-blue-700 hover:text-white transition-all focus:outline-none"
            >
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
              ) : (
                <FaUserCircle className="text-2xl mr-2" />
              )}
              <span>{profile.name}</span> {/* Display user's name */}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg overflow-hidden z-10">
                <ul className="text-gray-700">
                  <li>
                    <Link
                      to={profile.role === "admin" ? "/admin/profile" : "/user/profile"}
                      className="block px-4 py-2 hover:bg-gray-200 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

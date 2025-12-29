import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { UserContext } from '../../context/userContext';
import { FaHome, FaTasks, FaPlusCircle, FaUsers, FaChartLine, FaBuilding, FaTimes, FaSignInAlt } from 'react-icons/fa';

const SideMenu = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { user } = useContext(UserContext);

  // Safety check: ensure role is lowercase for comparison
  const role = user?.role ? user.role.toLowerCase() : 'user';
  const isAdmin = role === 'admin';

  // DEBUG: Check role
  console.log("Current User Role:", user?.role);
  console.log("Is Admin?", isAdmin);

  const isActive = (path) => location.pathname === path
    ? 'text-red-600 bg-red-50 font-bold border-r-4 border-red-600 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500'
    : 'text-gray-600 hover:text-red-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400';

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <div className={`fixed lg:static top-0 left-0 h-full w-[260px] bg-white dark:bg-[#0f172a] border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* HEADER: Logo */}
        <div className="p-6 flex items-center justify-between shrink-0">
          <img
            src={darkMode ? "/whitelogo.png" : "/blacklogo.png"}
            alt="TaskMate"
            className="h-8 w-auto object-contain"
          />
          <button onClick={onClose} className="lg:hidden text-gray-500 dark:text-gray-400">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">

          {/* --- COMMON FEATURES (User & Admin) --- */}
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Main Menu</p>

          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/dashboard')}`}>
            <FaHome className="w-5 text-center" /> Dashboard
          </Link>

          <Link to="/organization/tasks" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/organization/tasks')}`}>
            <FaTasks className="w-5 text-center" /> Organization Tasks
          </Link>

          <Link to="/create-task" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/create-task')}`}>
            <FaPlusCircle className="w-5 text-center" /> Create Task
          </Link>

          {/* --- ADMIN ONLY FEATURES --- */}
          {isAdmin && (
            <>
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Management</p>

              <Link to="/organization/members" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/organization/members')}`}>
                <FaUsers className="w-5 text-center" /> User Management
              </Link>

              <Link to="/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/analytics')}`}>
                <FaChartLine className="w-5 text-center" /> Analysis
              </Link>

              <Link to="/profile?tab=organization" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive('/profile?tab=organization')}`}>
                <FaBuilding className="w-5 text-center" /> Organization Settings
              </Link>
            </>
          )}
        </nav>

        {/* FOOTER: Profile (Fixed "Guest" issue) */}
        {user ? (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-[#0f172a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center font-bold border border-red-200 dark:border-red-800/50 uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{user.name}</h4>
                <p className="text-xs text-gray-400 truncate dark:text-gray-500 capitalize">
                  {isAdmin ? 'Administrator' : 'Team Member'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Only show this if strictly no user data found
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <Link to="/login" className="flex items-center gap-2 text-sm text-red-500 font-bold hover:underline">
              <FaSignInAlt /> Login to continue
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { FaBell, FaUser, FaBuilding, FaExchangeAlt, FaKey, FaSignOutAlt, FaChevronDown, FaMoon, FaSun, FaBars } from 'react-icons/fa';
import { UserContext } from '../context/userContext';
import { useTheme } from '../context/ThemeContext';

const Topbar = ({ onMenuClick }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Use Global Theme Context
    const { darkMode, toggleTheme } = useTheme();

    // Get User Data from Context
    const { user, clearUser } = useContext(UserContext);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (clearUser) clearUser();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeOrgName');
        localStorage.removeItem('activeOrgId');
        navigate('/login');
    };

    const handleSwitchOrg = () => {
        alert("Switch Organization feature coming soon!");
    };

    if (!user) return null;

    return (
        <div className="h-16 bg-white dark:bg-[#1e293b] border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm transition-colors">

            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-gray-500 dark:text-gray-300 hover:text-red-500 transition outline-none"
                >
                    <FaBars className="text-xl" />
                </button>

                <div className="text-sm breadcrumbs text-gray-500 dark:text-gray-400 hidden sm:block">
                    <span className="font-semibold">Workspace</span> / Dashboard
                </div>
            </div>

            {/* Right: Profile Section */}
            <div className="flex items-center gap-6">

                {/* Notification Icon */}
                <button className="relative text-gray-400 hover:text-red-500 transition">
                    <FaBell className="text-lg" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={dropdownRef}>

                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-xl transition outline-none"
                    >
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{user.name}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">
                                {user.role || 'Member'}
                            </div>
                        </div>

                        <Avatar name={user.name} className="bg-red-50 text-red-500 border-red-100" />

                        <FaChevronDown className={`text-gray-300 text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-fade-in-down z-50">

                            {/* Menu Items */}
                            <div className="py-1">
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setDropdownOpen(false)}>
                                    <FaUser className="w-5 text-center" /> View Profile
                                </Link>

                                {/* Organization Settings (Admin Only) */}
                                {user.role === 'admin' && (
                                    <Link to="/profile?tab=organization" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setDropdownOpen(false)}>
                                        <FaBuilding className="w-5 text-center" /> Organization Settings
                                    </Link>
                                )}

                                <button onClick={handleSwitchOrg} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
                                    <FaExchangeAlt className="w-5 text-center" /> Switch Organization
                                </button>

                                <button onClick={() => { navigate('/profile?tab=security'); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left">
                                    <FaKey className="w-5 text-center" /> Change Password
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTheme();
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition"
                                >
                                    {darkMode ? <FaSun className="w-5 text-center" /> : <FaMoon className="w-5 text-center" />}
                                    {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                </button>
                            </div>

                            {/* Logout */}
                            <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition text-left"
                                >
                                    <FaSignOutAlt className="w-5 text-center" /> Logout
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Topbar;

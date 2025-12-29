import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { FaUser, FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updateUser } = useContext(UserContext); // Adapted from login

    const { name, email, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // 1. Register API
            // Use API_PATHS.AUTH.REGISTER or hardcoded if not defined
            const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER || "/auth/register", {
                name,
                email,
                password,
                role: 'admin' // Defaulting self-registered users to admin who need to create an Org
            });

            // 2. Auto-login via Context
            const { token, ...userData } = res.data;
            const userObj = userData.user || userData;

            localStorage.setItem('token', token);
            updateUser({ ...userObj, token });

            // 3. Redirect to Onboarding to create organization
            navigate('/onboarding');

        } catch (err) {
            console.error(err.response?.data);
            setError(err.response?.data?.msg || err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // DARK RED GRADIENT BACKGROUND
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-950 p-4 text-gray-900">

            {/* CENTERED CARD */}
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md space-y-8 animate-fade-in-up relative overflow-hidden">

                {/* Optional Top Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-800"></div>

                {/* LARGE CENTERED LOGO */}
                <div className="flex justify-center">
                    <img
                        src="/blacklogo.png"
                        alt="Logo"
                        className="h-24 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
                    />
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-500">Start managing your tasks today</p>
                </div>

                {/* ERROR ALERT */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-md flex items-center">
                        <FaExclamationCircle className="text-red-600 mr-3" />
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                <form className="space-y-5" onSubmit={onSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                required
                                minLength="6"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
                                placeholder="•••••••• (Min 6 chars)"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                required
                                minLength="6"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all transform hover:scale-[1.02] disabled:opacity-70 mt-6"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-red-700 hover:text-red-900 transition">
                            Sign In here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

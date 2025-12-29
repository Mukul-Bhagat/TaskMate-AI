import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { FaUser, FaBuilding, FaBell, FaSpinner, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
    const location = useLocation();
    // Check if URL has ?tab=organization, otherwise default to 'personal'
    const initialTab = new URLSearchParams(location.search).get('tab') === 'organization' ? 'organization' : 'personal';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [org, setOrg] = useState({ name: '', address: '', phone: '', website: '' });
    const [loading, setLoading] = useState(false);
    const [fetchingOrg, setFetchingOrg] = useState(false);

    // Sync tab with URL if it changes (optional but good UX)
    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab');
        if (tab === 'organization') setActiveTab('organization');
    }, [location.search]);

    // Fetch Org Data if Admin and tab is active
    useEffect(() => {
        if (user.role === 'admin' && activeTab === 'organization') {
            fetchOrgDetails();
        }
    }, [activeTab, user.role]);

    const fetchOrgDetails = async () => {
        setFetchingOrg(true);
        try {
            const activeOrgName = localStorage.getItem('activeOrgName');
            if (activeOrgName) setOrg(prev => ({ ...prev, name: activeOrgName }));
            setFetchingOrg(false);
        } catch (err) { console.error(err); setFetchingOrg(false); }
    };

    const handleOrgUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Use the PUT endpoint we just created
            const res = await axiosInstance.put('/orgs/my-org', org);

            // Update local storage if name changed
            if (res.data.name) {
                localStorage.setItem('activeOrgName', res.data.name);
                // Dispatch event to update Topbar strictly if we weren't reloading
                window.dispatchEvent(new Event('storage'));
            }

            toast.success('Organization Updated Successfully');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Update Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-[#F8F9FA] dark:bg-[#0f172a] min-h-full font-sans transition-colors duration-300">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Account Settings</h1>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* --- SIDEBAR TABS --- */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`w-full text-left px-5 py-4 text-sm font-medium border-l-4 transition flex items-center ${activeTab === 'personal' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <FaUser className="mr-3" /> My Profile
                        </button>

                        {user.role === 'admin' && (
                            <button
                                onClick={() => setActiveTab('organization')}
                                className={`w-full text-left px-5 py-4 text-sm font-medium border-l-4 transition flex items-center ${activeTab === 'organization' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <FaBuilding className="mr-3" /> Organization Settings
                            </button>
                        )}

                        <button className="w-full text-left px-5 py-4 text-sm font-medium border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
                            <FaBell className="mr-3" /> Notifications
                        </button>

                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full text-left px-5 py-4 text-sm font-medium border-l-4 transition flex items-center ${activeTab === 'security' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <FaLock className="mr-3" /> Security
                        </button>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1">

                    {/* TAB: PERSONAL PROFILE */}
                    {activeTab === 'personal' && (
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h2>
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center text-3xl font-bold overflow-hidden">
                                    {user.profileImageUrl ? <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                                </div>
                                <div>
                                    <button className="bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                        Upload New Photo
                                    </button>
                                    <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size 800K</p>
                                </div>
                            </div>

                            <form className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Full Name</label>
                                    <input type="text" defaultValue={user.name} className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-red-200 outline-none bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Email Address</label>
                                    <input type="email" defaultValue={user.email} disabled className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500 dark:text-gray-400" />
                                </div>
                                <button type="button" onClick={() => toast.success("Profile Update Simulated")} className="bg-red-500 text-white px-6 py-2 rounded-lg mt-4 hover:bg-red-600 shadow-md">Save Changes</button>
                            </form>
                        </div>
                    )}

                    {/* TAB: ORGANIZATION SETTINGS */}
                    {activeTab === 'organization' && (
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 animate-fade-in">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Organization Settings</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your workspace details.</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded text-xs font-bold uppercase border border-blue-100 dark:border-blue-900/50">
                                    Admin Access
                                </div>
                            </div>

                            <form onSubmit={handleOrgUpdate} className="space-y-5 max-w-xl">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Organization Name</label>
                                    <input
                                        type="text"
                                        value={org.name}
                                        onChange={(e) => setOrg({ ...org, name: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-red-200 outline-none transition bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={org.phone}
                                            placeholder="+1 (555) 000-0000"
                                            onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-red-200 outline-none transition bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Website (Optional)</label>
                                        <input
                                            type="text"
                                            value={org.website}
                                            onChange={(e) => setOrg({ ...org, website: e.target.value })}
                                            placeholder="https://"
                                            className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-red-200 outline-none transition bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Address / Location</label>
                                    <textarea
                                        rows="3"
                                        value={org.address}
                                        onChange={(e) => setOrg({ ...org, address: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-red-200 outline-none transition bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <button
                                        type="button"
                                        className="text-red-500 text-sm font-medium hover:underline"
                                        onClick={() => toast('Delete feature coming soon', { icon: '🚧' })}
                                    >
                                        Delete Organization
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 shadow-md flex items-center gap-2 transition disabled:opacity-50"
                                    >
                                        {loading && <FaSpinner className="animate-spin" />}
                                        Save Organization
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: SECURITY / CHANGE PASSWORD */}
                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Change Password</h2>
                            <form className="max-w-md">
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                    <input type="password" className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-red-200 outline-none bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200" placeholder="••••••••" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <input type="password" className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-red-200 outline-none bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200" placeholder="••••••••" />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                    <input type="password" className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg focus:ring-2 focus:ring-red-200 outline-none bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200" placeholder="••••••••" />
                                </div>
                                <button type="button" onClick={() => toast.success("Password Updated Successfully!")} className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 shadow-md">Update Password</button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Profile;

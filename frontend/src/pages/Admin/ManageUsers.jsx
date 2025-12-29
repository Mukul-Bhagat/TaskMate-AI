import React, { useState, useEffect } from 'react';
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import ImportCSVModal from '../../components/ImportCSVModal';
import Avatar from '../../components/Avatar';
import { FaUserPlus, FaFileImport, FaUserCheck, FaSearch, FaEllipsisV, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Single Add Form State
  const [formData, setFormData] = useState({
    email: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ORG_MEMBERS || '/orgs/members');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.USERS.ADD_MEMBER || '/orgs/members', formData);
      alert('User Invited Successfully!');
      setFormData({ email: '' });
      fetchUsers();
    } catch (err) {
      alert('Error adding user: ' + (err.response?.data?.msg || err.message));
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

  return (
    <div className="p-8 bg-[#F8F9FA] dark:bg-[#0f172a] min-h-full font-sans transition-colors duration-300">

      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Users</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create, view, and manage user accounts and access.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* --- LEFT PANEL: ADD USER FORM --- */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">

          {/* Header with Import Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
              <FaUserPlus className="mr-2 text-red-500" /> Invite New User
            </h3>
            <button
              onClick={() => setShowImportModal(true)}
              className="text-red-500 border border-red-500 px-3 py-1.5 rounded text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center"
            >
              <FaFileImport className="mr-1" /> Import CSV
            </button>
          </div>

          <form onSubmit={handleAddUser}>
            {/* Email */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-2">
                An invite will be sent to this email with a temporary password.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#ff4d4f] hover:bg-[#ff7875] text-white font-semibold py-2.5 rounded-md transition shadow-sm flex justify-center items-center"
            >
              <FaUserCheck className="mr-2" /> Send Invite
            </button>

            <div className="text-center mt-3">
              <button type="button" onClick={() => setFormData({ email: '' })} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* --- RIGHT PANEL: USER LIST --- */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
              End Users
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                {filteredUsers.length}
              </span>
            </h3>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full text-sm focus:ring-2 focus:ring-gray-200 outline-none bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm px-3 bg-white dark:bg-[#0f172a] text-gray-600 dark:text-gray-300 outline-none">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 pl-2 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-400">Loading users...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-400">No users found.</td></tr>
                ) : filteredUsers.map(user => (
                  <tr key={user._id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">

                    {/* Name Column with Avatar & Lock Icon */}
                    <td className="py-4 pl-2 font-medium flex items-center gap-3">
                      <Avatar
                        name={user.name}
                        size="w-8 h-8"
                        textSize="text-xs"
                        className="bg-red-50 dark:bg-red-900/30 border-none text-red-600 dark:text-red-400"
                      />
                      <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-gray-200 font-semibold flex items-center gap-2">
                          {user.name}
                          <FaLock className="text-gray-300 dark:text-gray-600 text-xs" title="Credentials Set" />
                        </span>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td className="py-4 text-gray-500 dark:text-gray-400">{user.email}</td>

                    {/* Phone Column */}
                    <td className="py-4 text-gray-400 dark:text-gray-500">{user.phone || 'N/A'}</td>

                    {/* Action Column */}
                    <td className="py-4 text-right pr-2">
                      <button className="text-gray-400 hover:text-red-500 transition px-2">
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (Visual Only for now) */}
          {filteredUsers.length > 5 && (
            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
              <span>Showing 1-5 of {filteredUsers.length}</span>
              <div className="flex gap-1">
                <button className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"><FaChevronLeft /></button>
                <button className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800"><FaChevronRight /></button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Import Modal */}
      <ImportCSVModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default ManageUsers;
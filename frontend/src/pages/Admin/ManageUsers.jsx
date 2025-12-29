import React, { useState, useEffect } from 'react';
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import ImportCSVModal from '../../components/ImportCSVModal';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { FaUserPlus, FaFileImport, FaUserCheck, FaSearch, FaEllipsisV } from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Single Add Form State
  const [formData, setFormData] = useState({
    email: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ORG_MEMBERS);
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(API_PATHS.USERS.ADD_MEMBER, formData); // Sends { email: ... }
      alert('User Invited Successfully!');
      setFormData({ email: '' });
      fetchUsers();
    } catch (err) {
      alert('Error adding user: ' + (err.response?.data?.msg || err.message));
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

  return (
    <DashboardLayout activeMenu="Manage Members">
      <div className="p-8 bg-gray-50 min-h-screen font-sans">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Manage Users</h2>
            <p className="text-gray-500 mt-1">Create, view, and manage user accounts and access.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* --- LEFT PANEL: ADD USER FORM --- */}
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <FaUserPlus className="mr-2 text-red-500" />Invite New User
              </h3>
              <button
                onClick={() => setShowImportModal(true)}
                className="text-red-500 border border-red-500 px-3 py-1 rounded text-sm hover:bg-red-50 transition flex items-center"
              >
                <FaFileImport className="mr-1" /> Import CSV
              </button>
            </div>

            <form onSubmit={handleAddUser}>

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
                <input
                  type="email"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-red-200 outline-none"
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
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition shadow-md flex justify-center items-center"
              >
                <FaUserCheck className="mr-2" /> Send Invite
              </button>
            </form>
          </div>

          {/* --- RIGHT PANEL: USER LIST --- */}
          <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                End Users <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full ml-2">{filteredUsers.length}</span>
              </h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 pl-2 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-6 text-gray-400">No users found.</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="py-4 pl-2 font-medium flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold text-xs uppercase">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </td>
                      <td className="py-4 text-gray-500">{user.email}</td>
                      <td className="py-4 text-gray-400">{user.phone || 'N/A'}</td>
                      <td className="py-4 text-right pr-2">
                        <button className="text-gray-400 hover:text-red-500 transition">
                          <FaEllipsisV />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* --- IMPORT MODAL --- */}
        <ImportCSVModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchUsers}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
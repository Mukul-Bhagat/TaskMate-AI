import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { MdPeople, MdAccessTime, MdCheckCircle, MdPieChart } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa'; // Using fa-spinner alternative or similar

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalMembers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.DASHBOARD.GET_STATS);
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard stats", err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-6 bg-gray-50 min-h-screen">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Overview of your organization's performance.</p>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Total Members Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Team Members</p>
                <h2 className="text-3xl font-bold text-gray-800">{stats.totalMembers}</h2>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                <MdPeople className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Pending Tasks</p>
                <h2 className="text-3xl font-bold text-gray-800">{stats.pendingTasks}</h2>
              </div>
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <MdAccessTime className="text-2xl" />
              </div>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">In Progress</p>
                <h2 className="text-3xl font-bold text-gray-800">{stats.inProgressTasks}</h2>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                <FaSpinner className="text-2xl animate-spin" />
              </div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Completed</p>
                <h2 className="text-3xl font-bold text-gray-800">{stats.completedTasks}</h2>
              </div>
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <MdCheckCircle className="text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Activity / Quick Links */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <Link to="/task/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                + Assign New Task
              </Link>
              <Link to="/admin/manage-users" className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                Manage Team
              </Link>
            </div>
          </div>

          {/* Completion Rate Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded shadow text-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl">Productivity Pulse</h3>
              <p className="opacity-90">
                {stats.totalTasks > 0
                  ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% of assigned tasks are completed.`
                  : "No tasks assigned yet."
                }
              </p>
            </div>
            <div className="text-4xl opacity-50">
              <MdPieChart />
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

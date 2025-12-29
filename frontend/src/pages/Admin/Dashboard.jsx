import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import TaskDetailsModal from '../../components/TaskDetailsModal';
import Avatar from '../../components/Avatar';
import { UserContext } from '../../context/userContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    org: null,
    stats: { totalTasks: 0, pendingTasks: 0, completedTasks: 0, inProgressTasks: 0, totalMembers: 0 },
    recentTasks: []
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    // ... existing fetch logic ...
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch Stats, Tasks, AND Organization Details
        const [orgRes, statsRes, tasksRes] = await Promise.all([
          axiosInstance.get('/orgs/my-org'), // Fetch real org details
          axiosInstance.get(API_PATHS.DASHBOARD.GET_STATS),
          axiosInstance.get(API_PATHS.TASKS.GET_ORG_TASKS)
        ]);

        setData({
          org: orgRes.data, // Now contains real DB data
          stats: statsRes.data,
          recentTasks: tasksRes.data.slice(0, 5)
        });
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        // Fallback for org if fails (e.g. endpoint not ready)
        setData(prev => ({
          ...prev,
          org: { name: localStorage.getItem('activeOrgName') || "MY ORGANIZATION" }
        }));
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completionRate = data.stats.totalTasks > 0
    ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)
    : 0;

  if (loading || !user) return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-10 text-center text-gray-400">Loading Dashboard...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-8 bg-[#F8F9FA] dark:bg-[#0f172a] min-h-screen font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">

        {/* 1. WELCOME HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your organization today.</p>
        </div>

        {/* 2. STATS CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* ORG CARD */}
          <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-40 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <i className="fas fa-building bg-red-50 dark:bg-red-900/30 p-2 rounded-lg"></i>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Organization</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white uppercase tracking-wide truncate">
              {data.org?.name || "MY ORGANIZATION"}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">Admin: {user.email}</p>
          </div>

          <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-40 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <i className="fas fa-tasks bg-red-50 dark:bg-red-900/30 p-2 rounded-lg"></i>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Active Tasks</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">{data.stats.pendingTasks + data.stats.inProgressTasks}</h2>
          </div>

          <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-40 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <i className="fas fa-users bg-red-50 dark:bg-red-900/30 p-2 rounded-lg"></i>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Users</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">{data.stats.totalMembers}</h2>
          </div>

          <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-40 transition-colors">
            <div className="flex items-center gap-3 mb-2 text-red-500">
              <i className="fas fa-chart-pie bg-red-50 dark:bg-red-900/30 p-2 rounded-lg"></i>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Completion Rate</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">{completionRate}%</h2>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3. MAIN CONTENT: ONGOING TASKS LIST */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Ongoing Tasks</h3>
            <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">

              {data.recentTasks.length === 0 ? (
                <div className="text-center text-gray-400 py-10">No ongoing tasks found.</div>
              ) : (
                <div className="space-y-4">
                  {data.recentTasks.map(task => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
                             ${task.status === 'Completed' ? 'bg-green-100 text-green-500 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'}`}>
                          <i className={`fas ${task.status === 'Completed' ? 'fa-check' : 'fa-clipboard-list'}`}></i>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-500 transition">{task.title}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                                ${task.status === 'Completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Assigned to: {task.assignedTo[0]?.name || 'Unassigned'} • Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                          </p>
                        </div>
                      </div>

                      <div className="text-gray-300 dark:text-gray-600 group-hover:text-red-500">
                        <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <Link to="/organization/tasks" className="text-red-500 font-semibold text-sm hover:underline">
                  View All Tasks →
                </Link>
              </div>
            </div>
          </div>

          {/* 4. RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* Profile Card */}
            <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <Avatar name={user.name} size="w-16 h-16" textSize="text-2xl" />
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg">{user.name}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Organization Admin</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                <i className="fas fa-rocket mr-2 text-red-500"></i> Quick Actions
              </h4>
              <p className="text-sm text-gray-400 mb-4">Common actions.</p>

              <div className="space-y-2">
                <Link to="/create-task" className="block w-full text-left p-3 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm">
                  + Create New Task
                </Link>
                {user.role === 'admin' && (
                  <Link to="/organization/members" className="block w-full text-left p-3 rounded-lg bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm">
                    Manage Team Members
                  </Link>
                )}
                <Link to="/profile" className="block w-full text-left p-3 rounded-lg bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm">
                  My Profile Settings
                </Link>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white dark:bg-[#1e293b] dark:border-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-gray-800 dark:text-white mb-1">Account Status</h4>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Your account is active.
              </p>
            </div>
          </div>
        </div>

        {/* DETAILS MODAL */}
        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

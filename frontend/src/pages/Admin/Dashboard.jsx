import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { UserContext } from '../../context/userContext';
import { API_PATHS } from '../../utils/apiPaths';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    orgName: '',
    stats: { totalTasks: 0, pendingTasks: 0, inProgressTasks: 0, completedTasks: 0, totalMembers: 0 },
    recentTasks: []
  });

  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel requests using axiosInstance
        const [orgRes, statsRes, tasksRes] = await Promise.all([
          axiosInstance.get(API_PATHS.ORGANIZATION?.MY_ORG || '/organizations/my-org'),
          axiosInstance.get(API_PATHS.DASHBOARD?.STATS || '/dashboard/stats'),
          axiosInstance.get(API_PATHS.TASKS?.GET_ORGANIZATION_TASKS || '/tasks/organization')
        ]);

        setData({
          orgName: orgRes.data.name,
          stats: statsRes.data,
          recentTasks: tasksRes.data.slice(0, 3)
        });
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      }
    };

    // Only fetch if user is present
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading && !data.stats.totalTasks && !data.orgName) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  if (!user) return <div className="p-10 text-center text-gray-500">Please log in to view the dashboard.</div>;

  return (
    <div className="p-8 bg-[#F8F9FA] dark:bg-[#0f172a] min-h-full font-sans transition-colors duration-300">

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back, {user.name.split(' ')[0]}!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your organization today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Organization Card */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center h-40 group hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <i className="fas fa-building text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"></i>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organization</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate" title={data.orgName}>
            {data.orgName || "MY ORG"}
          </h2>
        </div>

        {/* Active Tasks Card */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center h-40 group hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <i className="fas fa-clipboard-list text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"></i>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Tasks</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
            {typeof data.stats.pendingTasks === 'number' ? data.stats.pendingTasks + (data.stats.inProgressTasks || 0) : 0}
          </h2>
        </div>

        {/* Total Users Card */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center h-40 group hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <i className="fas fa-users text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"></i>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
            {data.stats.totalMembers || 0}
          </h2>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center h-40 group hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <i className="fas fa-chart-pie text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"></i>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Rate</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
            {data.stats.totalTasks > 0 ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100) : 0}%
          </h2>
        </div>
      </div>

      {/* Bottom Section: Tasks & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task List (Left 2/3) */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Upcoming Tasks</h3>
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[400px]">
            {data.recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <i className="far fa-folder-open text-4xl mb-3 opacity-20"></i>
                <p>No upcoming tasks found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentTasks.map(task => (
                  <div key={task._id} className="flex items-center justify-between p-4 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 rounded-xl hover:border-red-200 dark:hover:border-red-900 transition cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center text-xl">
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-600 transition">{task.title}</h4>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <i className="far fa-clock"></i> Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                        </p>
                      </div>
                    </div>
                    <i className="fas fa-chevron-right text-gray-300 dark:text-gray-600 group-hover:text-red-500 transition"></i>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
              <Link to="/organization/tasks" className="text-red-600 font-semibold text-sm hover:underline">
                View All Tasks →
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Card (Right 1/3) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">{user.name}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{user.role}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{user.email}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <i className="fas fa-bolt text-red-500"></i> Quick Actions
            </h4>
            <div className="space-y-2 mt-4">
              <Link to="/create-task" className="block w-full text-left p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium hover:bg-red-100 transition text-sm">
                + Create New Task
              </Link>
              {user.role === 'admin' && (
                <Link to="/organization/members" className="block w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm">
                  Manage Team
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

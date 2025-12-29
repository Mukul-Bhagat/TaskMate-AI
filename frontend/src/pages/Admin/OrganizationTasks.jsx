import React, { useState, useEffect } from 'react';
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

const OrganizationTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch All Data
    const fetchTasks = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.TASKS.GET_ORG_TASKS);
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching tasks", err);
            toast.error("Failed to load organization tasks.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // 2. Handle Delete
    const handleDelete = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task? This cannot be undone.")) return;

        try {
            await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
            // Remove from UI immediately
            setTasks(tasks.filter(t => t._id !== taskId));
            toast.success("Task deleted successfully");
        } catch (err) {
            console.error(err);
            toast.error("Error deleting task");
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Pending': 'bg-red-100 text-red-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            'Completed': 'bg-green-100 text-green-800',
            'In Review': 'bg-purple-100 text-purple-800',
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    if (loading) return (
        <DashboardLayout activeMenu="Organization Tasks">
            <div className="p-6">Loading Master List...</div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout activeMenu="Organization Tasks">
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Organization Task Manager</h2>

                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tasks.map(task => (
                                <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                        <div className="text-sm text-gray-500">{task.description?.substring(0, 30)}...</div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {/* Show avatars or initials of assigned users */}
                                            {task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(user => (
                                                <div key={user._id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-500 flex items-center justify-center text-white text-xs font-bold" title={user.name}>
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                            )) : <span className="text-xs text-gray-400">Unassigned</span>}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(task.status)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(task.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(task._id)}
                                            className="text-red-600 hover:text-red-900 ml-4 font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {tasks.length === 0 && (
                        <div className="p-6 text-center text-gray-500 bg-gray-50">
                            No tasks found in your organization.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrganizationTasks;

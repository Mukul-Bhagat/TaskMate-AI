import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const OrganizationTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Tasks Logic
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axiosInstance.get(API_PATHS.TASKS?.GET_ORGANIZATION_TASKS || '/tasks/organization');
                setTasks(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching tasks", err);
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    return (
        // NO SIDEBAR, NO TOPBAR HERE - JUST CONTENT
        <div className="p-8 bg-[#F8F9FA] dark:bg-[#0f172a] min-h-full font-sans transition-colors duration-300">

            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Organization Task Manager</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and manage all tasks across your team.</p>
                </div>
            </div>

            {/* Task Table Card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a]/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-4 pl-2">Task Title</div>
                    <div className="col-span-3">Assigned To</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Created Date</div>
                    <div className="col-span-1 text-right pr-2">Actions</div>
                </div>

                {/* Table Body */}
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center text-gray-400">
                        <i className="far fa-clipboard text-4xl mb-3 opacity-20"></i>
                        <p>No tasks found in your organization.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tasks.map(task => (
                            <div key={task._id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">

                                {/* Title */}
                                <div className="col-span-4 pl-2 font-semibold text-gray-800 dark:text-gray-200">
                                    {task.title}
                                </div>

                                {/* Assigned To */}
                                <div className="col-span-3 flex -space-x-2 overflow-hidden">
                                    {task.assignedTo && task.assignedTo.map((u, i) => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1e293b] bg-red-100 dark:bg-red-900 text-red-500 dark:text-red-400 flex items-center justify-center text-xs font-bold" title={u.name}>
                                            {u.name ? u.name.charAt(0) : '?'}
                                        </div>
                                    ))}
                                </div>

                                {/* Status Badge */}
                                <div className="col-span-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${task.status === 'Completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                            task.status === 'In Progress' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {task.status}
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 text-right pr-2">
                                    <button className="text-gray-400 hover:text-red-500 transition">
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationTasks;

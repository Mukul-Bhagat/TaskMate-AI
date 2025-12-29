import React, { useEffect, useState, useContext } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import moment from "moment";
import { MdCalendarToday, MdTaskAlt, MdAccessTime, MdArrowForward } from "react-icons/md";
import toast from "react-hot-toast";

const MyTaskCard = ({ task, onClick, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-50 text-red-600 border-red-100";
      case "Medium": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Low": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Review": return "text-purple-600 bg-purple-50";
      case "Completed": return "text-green-600 bg-green-50";
      case "In Progress": return "text-blue-600 bg-blue-50";
      default: return "text-amber-600 bg-amber-50";
    }
  };

  const completedSubtasks = task.todoChecklist?.filter(t => t.completed).length || 0;
  const totalSubtasks = task.todoChecklist?.length || 0;
  // Use backend progress if available, else calculate fallback
  const progressPercent = task.progress !== undefined
    ? task.progress
    : (totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <select
          className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full outline-none cursor-pointer ${getStatusColor(task.status)}`}
          value={task.status}
          onClick={(e) => e.stopPropagation()} // Prevent card click
          onChange={(e) => onStatusChange(task._id, e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <h3 className="text-gray-900 font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-1">
        {task.title}
      </h3>

      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
        {task.description || "No description provided."}
      </p>

      {/* Date & Meta */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-50">
        <div className="flex items-center text-gray-500 text-xs font-medium">
          <MdCalendarToday className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          {task.dueDate ? moment(task.dueDate).format("MMM D, YYYY") : "No Date"}
        </div>
        <div className="flex items-center text-gray-500 text-xs font-medium">
          <MdAccessTime className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          {moment(task.createdAt).fromNow(true)} ago
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-primary'
                }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 font-medium py-2.5 rounded-xl transition-all duration-200 text-sm group-hover:bg-primary/5"
        >
          {task.status === 'Completed' ? 'View Details' : 'Continue Task'}
          <MdArrowForward className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${task.status === 'Completed' ? '' : 'text-primary'}`} />
        </button>
      </div>
    </div>
  );
};

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'completed'
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      // Use the new Secure Endpoint
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_MY_ORG_TASKS);

      if (response.data && response.data.tasks) {
        setAllTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error fetching my tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic Update
      const previousTasks = [...allTasks];
      setAllTasks(currentTasks =>
        currentTasks.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );

      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId), { status: newStatus });
      toast.success("Status Updated");

      // Optionally refresh to get side-effects (like progress update)
      // fetchMyTasks(); 
    } catch (error) {
      toast.error("Failed to update status");
      fetchMyTasks(); // Revert
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  // Client-side filtering as requested for Tabs
  const filteredTasks = allTasks.filter(task => {
    if (activeTab === "active") {
      return ["Pending", "In Progress", "In Review"].includes(task.status);
    } else {
      return task.status === "Completed";
    }
  });

  const activeCount = allTasks.filter(t => ["Pending", "In Progress", "In Review"].includes(t.status)).length;
  const completedCount = allTasks.filter(t => t.status === "Completed").length;

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and track your assigned work.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "active" ? "text-primary" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Active Tasks
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "active" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}>
              {activeCount}
            </span>
            {activeTab === "active" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-3 text-sm font-medium transition-all relative ${activeTab === "completed" ? "text-primary" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Completed
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "completed" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}>
              {completedCount}
            </span>
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white h-[300px] rounded-2xl animate-pulse border border-gray-100 p-5">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-8"></div>
                <div className="mt-auto h-10 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTasks.map((task) => (
              <MyTaskCard
                key={task._id}
                task={task}
                onClick={() => handleClick(task._id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <MdTaskAlt className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === "active" ? "All Caught Up!" : "No Completed Tasks Yet"}
            </h3>
            <p className="text-gray-500 max-w-sm mt-2">
              {activeTab === "active"
                ? "You have no active tasks assigned to you right now. Enjoy your day!"
                : "Tasks you finish will appear here."}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;

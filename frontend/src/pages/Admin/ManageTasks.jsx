import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet, LuPlus } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";

import CreateTaskModal from "../../components/modals/CreateTaskModal";
import EditTaskModal from "../../components/modals/EditTaskModal";
import toast from 'react-hot-toast';

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const navigate = useNavigate();

  // --- Fetch Logic ---

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_ALL_TASKS,
        {
          params: {
            status: filterStatus === "All" ? "" : filterStatus,
          },
        }
      );

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // Map statusSummary data
      const statusSummary = response.data?.statusSummary || {};
      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgressTasks || 0 },
        { label: "Completed", count: statusSummary.completedTasks || 0 },
      ];
      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getAllTasks();
    getAllUsers();
  }, [filterStatus]);


  // --- Handlers ---

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axiosInstance.delete(`/api/tasks/${taskId}`);
        toast.success("Task deleted successfully");
        getAllTasks(); // Refresh list
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleTaskUpdated = () => {
    getAllTasks(); // Refresh
  };

  const handleClick = (task) => {
    if (task.assignmentType === "individual") {
      navigate(`/admin/master-task/${task._id}`);
    } else {
      navigate(`/user/task-details/${task._id}`);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download report.");
    }
  };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manage Tasks</h2>
            <p className="text-sm text-gray-500">Track and assign tasks to your team.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {tabs?.[0]?.count > 0 && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            )}

            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <LuPlus className="text-lg" />
                Create Task
              </button>

              <button
                className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                onClick={handleDownloadReport}
              >
                <LuFileSpreadsheet className="text-lg text-green-600" />
                Report
              </button>
            </div>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {allTasks?.map((item) => (
            <TaskCard
              key={item._id}
              title={item.title}
              description={item.description}
              priority={item.priority}
              status={item.status}
              progress={item.progress}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              assignedTo={item.assignedTo}
              attachmentCount={item.attachments?.length || 0}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() => handleClick(item)}
              onEdit={() => handleEditTask(item)}
              onDelete={() => handleDeleteTask(item._id)}
            />
          ))}
          {allTasks.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No tasks found in this category.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        users={users}
        onTaskCreated={getAllTasks}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </DashboardLayout>
  );
};

export default ManageTasks;
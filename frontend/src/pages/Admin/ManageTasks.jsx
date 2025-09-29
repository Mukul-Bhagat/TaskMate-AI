import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import UserCard from "../../components/Cards/UserCard";


const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();

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

      // Map statusSummary data with fixed labels and order
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

  const handleClick = (task) => {
    if (task.assignmentType === "individual") {
      navigate(`/admin/master-task/${task._id}`);
    } else {
      // Use the 'task' variable from the function's argument
      navigate("/admin/create-task", { state: { taskID: task._id } });
    }
  };

  // download task report

const handleDownloadReport = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
      responseType: "blob",
    });

    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "task_details.xlsx");
    document.body.appendChild(link);
    link.click();
    
    // Clean up the URL and link
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error downloading expense details:", error);
    toast.error("Failed to download expense details. Please try again.");
  }
};

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);

  // The JSX for the UI is not shown in the screenshots,
  // but it would go here.
  return (
    <DashboardLayout activeMenu="Manage Tasks">
  <div className="my-5">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
      <div className="flex items-center justify-between gap-3">
        {/* The <h2>My Tasks</h2> would go here */}
      </div>
      
      {tabs?.[0]?.count > 0 && (
        <div className="flex items-center gap-3">
          <TaskStatusTabs
            tabs={tabs}
            activeTab={filterStatus}
            setActiveTab={setFilterStatus}
          />
        </div>
      )}

      <button
        className="flex download-btn"
        onClick={handleDownloadReport}
      >
        <LuFileSpreadsheet className="text-lg" />
        Download Report
      </button>
    </div>

    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {allTasks?.map((item, index) => (
          <TaskCard
            key={item._id}
            title={item.title}
            description={item.description}
            priority={item.priority}
            status={item.status}
            progress={item.progress}
            createdAt={item.createdAt}
            dueDate={item.dueDate}
            assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
            attachmentCount={item.attachments?.length || 0}
            completedTodoCount={item.completedTodoCount || 0}
            todoChecklist={item.todoChecklist || []}
            onClick={() => {
              handleClick(item);
            }}
          />
        ))}
      </div>
    </div>
  </div>
</DashboardLayout>
  )
};

export default ManageTasks;
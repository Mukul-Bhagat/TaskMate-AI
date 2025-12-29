import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import moment from "moment";
import AvatarGroup from "../../components/layouts/AvatarGroup";
import { MdOpenInNew, MdCalendarToday, MdCheckCircle, MdAccessTime, MdInfo, MdVerified, MdCancel } from "react-icons/md";
import { BsGoogle } from "react-icons/bs";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const ViewTaskDetails = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [task, setTask] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Safely check role
  const isAdmin = user?.role === "admin";

  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-600 bg-cyan-50 border border-cyan-200";
      case "In Review":
        return "text-purple-600 bg-purple-50 border border-purple-200";
      case "Completed":
        return "text-lime-600 bg-lime-50 border border-lime-200";
      default:
        return "text-yellow-600 bg-yellow-50 border border-yellow-200";
    }
  };

  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));
      if (response.data) setTask(response.data);
    } catch (error) {
      console.error("Error fetching task details:", error);
    }
  };

  const updateTodoChecklist = async (index) => {
    // If locked, prevent interaction
    if (task?.status === "In Review" || task?.status === "Completed") return;

    const todoChecklist = [...task?.todoChecklist];
    if (todoChecklist && todoChecklist[index]) {
      // Optimistic update
      todoChecklist[index].completed = !todoChecklist[index].completed;
      // We assume ownership update on backend, but UI uses optimistic 'completed' status

      const originalTask = { ...task };
      // Temporary local calculation for instant smooth progress bar
      const completedCount = todoChecklist.filter(i => i.completed).length;
      const newProgress = Math.round((completedCount / todoChecklist.length) * 100);

      setTask({ ...task, todoChecklist, progress: newProgress });

      try {
        const response = await axiosInstance.put(
          API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
          { todoChecklist }
        );

        if (response.status === 200) {
          const updatedTask = response.data?.task;
          setTask(updatedTask);
          if (updatedTask.status === "In Review" && updatedTask.status !== originalTask.status) {
            confetti({ particleCount: 150, spread: 60, origin: { y: 0.6 } });
            toast.success("Task sent for Review!");
          }
        }
      } catch (error) {
        // Revert on error
        setTask(originalTask);
        toast.error("Failed to update checklist.");
      }
    }
  };

  const handleAdminReview = async (action) => {
    setIsReviewing(true);
    try {
      const response = await axiosInstance.put(API_PATHS.TASKS.REVIEW_TASK(id), { action });
      setTask(response.data.task);

      if (action === "APPROVE") {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        toast.success("Task Approved & Completed!");
      } else {
        toast("Task rejected and sent back to In Progress", { icon: "↩️" });
      }
    } catch (error) {
      console.error("Review failed", error);
      toast.error("Action failed");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleAddToCalendar = async () => {
    try {
      await axiosInstance.post(`${API_PATHS.TASKS.BASE}/${task._id}/schedule`);
      toast.success("Task scheduled on your Google Calendar!");
    } catch (error) {
      console.error("Error scheduling task:", error.response);
      if (error.response?.status === 401 && error.response.data?.authUrl) {
        window.location.href = error.response.data.authUrl;
      } else {
        toast.error("Failed to schedule task.");
      }
    }
  };

  useEffect(() => {
    if (id) getTaskDetailsByID();
  }, [id]);

  if (!task) return <DashboardLayout activeMenu="My Tasks"><div className="mt-10 text-center text-gray-400">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5 max-w-5xl mx-auto space-y-6">

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">

          {/* Review Banner for Members */}
          {task.status === "In Review" && !isAdmin && (
            <div className="bg-purple-50 text-purple-700 px-6 py-3 text-sm font-medium border-b border-purple-100 flex items-center justify-center gap-2">
              <MdAccessTime className="text-lg" />
              Task is locked and waiting for Admin Approval. You cannot make changes.
            </div>
          )}

          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusTagColor(task.status)}`}>
                  {task.status}
                </span>
                {task.priority && (
                  <span className="text-xs font-bold px-2 py-1 rounded text-gray-500 bg-gray-100 border border-gray-200">
                    {task.priority} Priority
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{task.title}</h1>

              {/* Linear Progress Bar */}
              <div className="max-w-md pt-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ease-out ${task.status === "Completed" ? "bg-lime-500" :
                        task.status === "In Review" ? "bg-purple-500" : "bg-blue-500"
                      }`}
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-center">
              {/* Admin Actions */}
              {task.status === "In Review" && isAdmin ? (
                <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 w-full md:w-64">
                  <p className="text-xs font-bold text-gray-500 uppercase text-center mb-1">Admin Action</p>
                  <button
                    onClick={() => handleAdminReview("APPROVE")}
                    disabled={isReviewing}
                    className="w-full bg-lime-600 hover:bg-lime-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <MdVerified /> Approve & Complete
                  </button>
                  <button
                    onClick={() => handleAdminReview("REJECT")}
                    disabled={isReviewing}
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <MdCancel className="text-rose-500" /> Reject / Request Changes
                  </button>
                </div>
              ) : (
                // Standard Action
                <button
                  onClick={handleAddToCalendar}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <BsGoogle className="text-blue-500" /> Add to Calendar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50/30">
            {/* Checklist Section */}
            <div className="col-span-2 p-6 md:p-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MdCheckCircle className="text-lg text-gray-400" /> Checklist
              </h3>
              <div className="space-y-3">
                {task.todoChecklist?.map((item, index) => (
                  <TodoChecklist
                    key={index}
                    item={item}
                    onChange={() => updateTodoChecklist(index)}
                    // Disable if Locked
                    disabled={task.status === "In Review" || task.status === "Completed"}
                  />
                ))}
                {(!task.todoChecklist || task.todoChecklist.length === 0) && (
                  <p className="text-sm italic text-gray-400">No sub-tasks created.</p>
                )}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{task.description || "No description."}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Team</h4>
                <AvatarGroup avatars={task.assignedTo?.map(u => u.profileImageUrl) || []} maxVisible={5} />
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Due Date</h4>
                <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                  <MdCalendarToday className="text-gray-400" />
                  {task?.dueDate ? moment(task.dueDate).format("MMMM Do, YYYY") : "N/A"}
                </div>
              </div>

              {task.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attachments</h4>
                  <div className="space-y-2">
                    {task.attachments.map((link, idx) => (
                      <a key={idx} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-colors group">
                        <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                          <MdOpenInNew />
                        </div>
                        <span className="text-xs text-gray-600 font-medium truncate flex-1">Attachment {idx + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Sub-components
const TodoChecklist = ({ item, onChange, disabled }) => {
  return (
    <div
      onClick={!disabled ? onChange : undefined}
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group
        ${disabled ? 'cursor-not-allowed opacity-80 bg-gray-50 border-gray-200' : 'cursor-pointer hover:shadow-md hover:border-blue-200 bg-white border-gray-200'}
        ${item.completed ? 'bg-green-50/40 border-green-100' : ''}`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors
          ${item.completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover:border-blue-400'}`}>
        {item.completed && <MdCheckCircle className="text-white text-sm" />}
      </div>

      <div className="flex-1">
        <p className={`text-sm font-medium transition-colors ${item.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
          {item.text}
        </p>
      </div>

      {item.completed && item.completedBy ? (
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100" title={`Completed by ${item.completedBy.name}`}>
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-sm ring-1 ring-gray-100">
            {item.completedBy.profileImageUrl ? (
              <img src={item.completedBy.profileImageUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                {item.completedBy.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ViewTaskDetails;

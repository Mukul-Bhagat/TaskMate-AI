import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import Select from "react-select"; // Use react-select
import Modal from "../../components/Model";
import DeleteAlert from "../../components/DeleteAlert";

const CreateTask = () => {
  const location = useLocation();
  const { taskID } = location.state || {};
  const navigate = useNavigate();

  // State for the main form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);

  // State for user options and loading
  const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  
  // Fetch team members for the dropdown
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
        const options = response.data.map(user => ({
          value: user._id,
          label: `${user.name} (${user.email})`,
        }));
        setTeamMemberOptions(options);
      } catch (error) {
        toast.error("Could not load team members.");
      }
    };
    fetchTeamMembers();
  }, []);

  // Fetch existing task details if in "update" mode
  useEffect(() => {
    const getTaskDetailsByID = async (id) => {
      try {
        const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));
        const task = response.data;
        setTitle(task.title);
        setDescription(task.description);
        setPriority(PRIORITY_DATA.find(p => p.value === task.priority));
        setDueDate(moment(task.dueDate).format("YYYY-MM-DD"));
        // Format assigned users for react-select
        const selectedUsers = task.assignedTo.map(user => ({
          value: user._id,
          label: `${user.name} (${user.email})`,
        }));
        setAssignedTo(selectedUsers);
      } catch (error) {
        console.error("Error fetching task details:", error);
        toast.error("Failed to fetch task details.");
      }
    };

    if (taskID) {
      getTaskDetailsByID(taskID);
    }
  }, [taskID]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);

    const payload = {
      title,
      description,
      priority: priority?.value,
      dueDate,
      assignedTo: assignedTo.map(member => member.value), // Extract just IDs
    };

    try {
      if (taskID) {
        await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskID), payload);
        toast.success("Task updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload);
        toast.success("Task created successfully!");
      }
      navigate('/admin/tasks');
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error(error.response?.data?.message || "Failed to submit task.");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskID));
      toast.success("Task deleted successfully"); // Corrected message
      setOpenDeleteAlert(false);
      navigate('/admin/tasks');
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  return (
    <DashboardLayout activeMenu={taskID ? "Manage Tasks" : "Create Task"}>
      <div className="card max-w-3xl mx-auto my-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">{taskID ? "Update Task" : "Create New Task"}</h2>
          {taskID && (
            <button onClick={() => setOpenDeleteAlert(true)} className="add-btn bg-red-500 hover:bg-red-600">
              <LuTrash2 /> Delete
            </button>
          )}
        </div>

        {/* FIX: Wrap content in a <form> with onSubmit */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Input label="Task Title" value={title} onChange={({ target }) => setTitle(target.value)} required />
            
            <div>
              <label className="text-[13px] text-slate-800">Description</label>
              <textarea value={description} onChange={({ target }) => setDescription(target.value)} rows={5} className="input-box" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[13px] text-slate-800 mb-3 block">Priority</label>
                <Select options={PRIORITY_DATA} value={priority} onChange={setPriority} />
              </div>
              <Input label="Due Date" value={dueDate} onChange={({ target }) => setDueDate(target.value)} type="date" required />
            </div>

            <div>
              <label className="text-[13px] text-slate-800 mb-3 block">Assign To</label>
              <Select isMulti options={teamMemberOptions} value={assignedTo} onChange={setAssignedTo} placeholder="Search and select team members..." />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            {/* FIX: Changed button to type="submit" */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (taskID ? "Updating..." : "Creating...") : (taskID ? "Update Task" : "Create Task")}
            </button>
          </div>
        </form>
      </div>

      <Modal isOpen={openDeleteAlert} onClose={() => setOpenDeleteAlert(false)} title="Delete Task">
        <DeleteAlert content="Are you sure you want to delete this task?" onDelete={deleteTask} />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateTask;

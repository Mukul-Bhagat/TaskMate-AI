import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA} from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import SelectDropdown from "../../components/inputs/SelectDropdown";
import SelectUsers from "../../components/inputs/SelectUsers";
import TodoListInput from "../../components/inputs/TodoListInput";
import AddAttachmentsInput from "../../components/inputs/AddAttachmentsInput";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Model";

const CreateTask = () => {
  const location = useLocation();
  const { taskID } = location.state || {};
  const navigate = useNavigate();

  // State for the main form data
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  // Additional states for component logic
  const [currentTask, setCurrentTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [assignmentType, setAssignmentType] = useState("group");// 'group' or 'individual'

  // Generic handler to update form fields
  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  // Function to reset the form to its initial state
  const clearData = () => {
    // reset form
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  // --- API Functions ---

  //Create Task
  const createTask = async () => {
    setLoading(true);

    try {
      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));

      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
        assignmentType: assignmentType,
      });

      toast.success("Task Created Successfully");
      clearData();
    } catch (error) {
      console.error("Error creating task:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  //update Task
  const updateTask = async () => {
  setLoading(true);

  try {
    const todolist = taskData.todoChecklist?.map((item) => {
      const prevTodoChecklist = currentTask?.todoChecklist || [];
      const matchedTask = prevTodoChecklist.find((task) => task.text === item);

      return {
        text: item,
        completed: matchedTask ? matchedTask.completed : false,
      };
    });

    const response = await axiosInstance.put(
      API_PATHS.TASKS.UPDATE_TASK(taskID),
      {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      }
    );

    toast.success("Task Updated Successfully");

  } catch (error) {
    console.error("Error creating task:", error); // Note: The screenshot shows "creating task" here
    setLoading(false);
  } finally {
    setLoading(false);
  }
};

  //Submit
  const handleSubmit = async () => {
  setError(null);

  // Input validation
  if (!taskData.title.trim()) {
    setError("Title is required.");
    return;
  }

  if (!taskData.description.trim()) {
    setError("Description is required.");
    return;
  }

  if (!taskData.dueDate) {
    setError("Due date is required.");
    return;
  }

  if (taskData.assignedTo?.length === 0) {
    setError("Task not assigned to any member");
    return;
  }

  if (taskData.todoChecklist?.length === 0) {
    setError("Add atleast one todo task");
    return;
  }

  if (taskID) {
    updateTask();
    return;
  }

  createTask();
};

  //Get task Info
  const getTaskDetailsByID = async (taskID) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.TASKS.GET_TASK_BY_ID(taskID)
    );

    if (response.data) {
      const taskInfo = response.data;
      setCurrentTask(taskInfo);

      setTaskData((prevState)=>({
        title: taskInfo.title,
        description: taskInfo.description,
        priority: taskInfo.priority,
        dueDate: taskInfo.dueDate
          ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
          : null,
        assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
        todoChecklist: taskInfo?.todoChecklist?.map((item) => item?.text) || [],
        attachments: taskInfo?.attachments || [],
      }));
    }
  } catch (error) {
    console.error("Error fetching task details:", error);
  }
};

  //delete Task
  const deleteTask = async () => {
  try {
    await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskID));

    setOpenDeleteAlert(false);
    toast.success("Expense details deleted successfully");
    navigate('/admin/tasks');
  } catch (error) {
    console.error(
      "Error deleting expense:",
      error.response?.data?.message || error.message
    );
  }
};

  useEffect(() => {
  if (taskID) {
    getTaskDetailsByID(taskID);
  }
  return() =>{};
}, [taskID]);

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4 gap-x-4">
          <div className="form-card col-span-3">
            {/* Form Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                {taskID ? "Update Task" : "Create Task"}
              </h2>

              {/* Delete Button (only shows when updating a task) */}
              {taskID && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            {/* Task Title Input */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Task Title
              </label>
              <div className="mt-2">
                <input
                  placeholder="Title for Task"
                  className="form-input"
                  value={taskData.title}
                  onChange={({ target }) =>
                    handleValueChange("title", target.value)
                  }
                />
              </div>

              <div className="mt-3">
                <label className="text-xs font-medium text-slate-600">
                  Description
                </label>
                <textarea
                  placeholder="Describe task"
                  className="form-input"
                  rows={4}
                  value={taskData.description}
                  onChange={({ target }) =>
                  handleValueChange("description", target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-2">
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-600">
                    Priority
                  </label>
                  <SelectDropdown
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                  placeholder="Select Priority"
                  />
                </div>
                  <div className="col-span-6 md:col-span-4">
                    <label className="text-xs font-medium text-slate-600">
                      Due Date
                    </label>
                    <input
                      placeholder="Create App UI"
                      className="form-input"
                      value={taskData.dueDate}
                      onChange={({ target }) =>
                        handleValueChange("dueDate", target.value)
                      }
                      type="date"
                    />
                  </div>
                  </div>
                  {/* Add this block in your CreateTask.jsx form */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-600">Assignment Type</label>
                  <div className="flex items-center gap-4 mt-2 ">
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="radio"
                        id="group"
                        name="assignmentType"
                        value="group"
                        checked={assignmentType === "group"}
                        onChange={() => setAssignmentType("group")}
                        className="w-4 h-4 text-primary"
                      />
                      <label htmlFor="group" className="text-sm ">In Group</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="individual"
                        name="assignmentType"
                        value="individual"
                        checked={assignmentType === "individual"}
                        onChange={() => setAssignmentType("individual")}
                        className="w-4 h-4 text-primary"
                      />
                      <label htmlFor="individual" className="text-sm">Individually</label>
                    </div>
                  
                </div>

                  <div className="col-span-12 mt-4 md:col-span-3">
                    <label className="text-xs font-medium text-slate-600">
                      Assign To
                    </label>
                  <SelectUsers
                    selectedUsers={taskData.assignedTo}
                    setSelectedUsers={(value) => {
                      handleValueChange("assignedTo", value);
                      }}
                    />
                  </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="text-xs font-medium text-slate-600">
                      TODO Checklist
                    </label>
                    <TodoListInput
                      todoList={taskData?.todoChecklist}
                      setTodoList={(value) =>
                        handleValueChange("todoChecklist", value)
                      }
                    />
                </div>
                

                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-600">
                    Add Attachments
                  </label>
                  <AddAttachmentsInput
                    attachments={taskData?.attachments}
                    setAttachments={(value) =>
                      handleValueChange("attachments", value)
                    }
                  />
                </div>
          
                    {error && (
                <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
              )}

              <div className="flex justify-end mt-7">
                <button
                  className="add-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {taskID ? "UPDATE TASK" : "CREATE TASK"}
                </button>
              </div>
          </div>

            {/* Other form fields will be added here */}

          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={() => deleteTask()}
        />
      </Modal>

    </DashboardLayout>
  );
};

export default CreateTask;
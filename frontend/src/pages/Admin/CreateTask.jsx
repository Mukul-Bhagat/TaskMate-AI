import React, { useEffect, useState, useRef, useContext } from "react";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import SelectDropdown from "../../components/inputs/SelectDropdown";
import TodoListInput from "../../components/inputs/TodoListInput";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";
import { FaPaperclip, FaLink, FaImage, FaTrash, FaCheck } from 'react-icons/fa';
import { UserContext } from "../../context/userContext";

const CreateTask = () => {
  const location = useLocation();
  const { taskID } = location.state || {};
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user } = useContext(UserContext);

  // State for the main form data
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
    files: []
  });

  const [colleagues, setColleagues] = useState([]); // Store fetched users
  const [currentTask, setCurrentTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  // Link Input State
  const [linkInput, setLinkInput] = useState('');
  const [linkNameInput, setLinkNameInput] = useState('');

  // Fetch Colleagues
  useEffect(() => {
    const fetchColleagues = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.AUTH.GET_ALL_USER || "/auth/all-users");
        setColleagues(res.data);
      } catch (err) {
        console.error("Failed to fetch colleagues", err);
      }
    };
    fetchColleagues();
  }, []);

  // Generic handler to update form fields
  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: "",
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
      files: []
    });
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    const newLink = {
      type: 'link',
      url: linkInput,
      name: linkNameInput || linkInput
    };
    handleValueChange('attachments', [...taskData.attachments, newLink]);
    setLinkInput('');
    setLinkNameInput('');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleValueChange('files', [...taskData.files, ...selectedFiles]);
  };

  const removeAttachment = (index, type) => {
    if (type === 'link' || type === 'server-file') {
      const updated = [...taskData.attachments];
      updated.splice(index, 1);
      handleValueChange('attachments', updated);
    } else {
      const updated = [...taskData.files];
      updated.splice(index, 1);
      handleValueChange('files', updated);
    }
  };

  const createTask = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', taskData.title);
      formData.append('description', taskData.description);
      formData.append('priority', taskData.priority);
      formData.append('dueDate', new Date(taskData.dueDate).toISOString());

      const assigneeIds = taskData.assignedTo;
      formData.append('assignmentType', 'group');
      formData.append('assignedTo', assigneeIds.join(','));

      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));
      formData.append('todoChecklist', JSON.stringify(todolist));
      formData.append('attachments', JSON.stringify(taskData.attachments.filter(a => a.type === 'link')));

      taskData.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Task Created Successfully");
      clearData();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!taskData.title.trim()) { setError("Title is required."); return; }
    if (!taskData.description.trim()) { setError("Description is required."); return; }
    if (!taskData.dueDate) { setError("Due date is required."); return; }

    if (taskData.assignedTo?.length === 0) {
      setError("Please assign the task to at least one member (or yourself).");
      return;
    }

    if (taskID) {
      toast.error("Update with files not fully implemented yet.");
      return;
    }

    createTask();
  };

  return (
    <div className="p-8 bg-[#F8F9FA] dark:bg-[#0f172a] min-h-full font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {taskID ? "Update Task" : "Create New Task"}
          </h2>
          {taskID && (
            <button
              className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              onClick={() => setOpenDeleteAlert(true)}
            >
              <LuTrash2 /> Delete
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Task Title</label>
            <input
              placeholder="e.g. Redesign Landing Page"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
              value={taskData.title}
              onChange={({ target }) => handleValueChange("title", target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Description</label>
            <textarea
              placeholder="Detailed explanation of the task..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition h-32 bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200"
              value={taskData.description}
              onChange={({ target }) => handleValueChange("description", target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Priority</label>
            <SelectDropdown
              options={PRIORITY_DATA}
              value={taskData.priority}
              onChange={(value) => handleValueChange("priority", value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Due Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm outline-none bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200 scheme-light dark:scheme-dark"
              value={taskData.dueDate}
              onChange={({ target }) => handleValueChange("dueDate", target.value)}
            />
          </div>
        </div>

        {/* Assignment Section - Checkbox Grid */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Assign Team Members</label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-[#0f172a]/50">

              {colleagues.map(userItem => {
                const isSelected = taskData.assignedTo.includes(userItem._id);
                return (
                  <div
                    key={userItem._id}
                    onClick={() => {
                      const newAssignments = isSelected
                        ? taskData.assignedTo.filter(id => id !== userItem._id)
                        : [...taskData.assignedTo, userItem._id];
                      handleValueChange("assignedTo", newAssignments);
                    }}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer border transition-all
                         ${isSelected
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 shadow-sm'
                        : 'bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-700 hover:border-red-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                         ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                      {isSelected && <FaCheck className="text-white text-xs" />}
                    </div>

                    <div>
                      <p className={`text-sm font-semibold ${isSelected ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {userItem.name}
                        {userItem._id === user?._id && " (You)"}
                      </p>
                      <p className="text-xs text-gray-400">{userItem.role}</p>
                    </div>
                  </div>
                );
              })}

              {colleagues.length === 0 && (
                <div className="text-gray-400 text-sm p-2">No members found.</div>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Selected: <span className="font-bold text-gray-700 dark:text-gray-300">{taskData.assignedTo.length} members</span>
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-8">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Todo / Sub-tasks</label>
          <TodoListInput
            todoList={taskData?.todoChecklist}
            setTodoList={(value) => handleValueChange("todoChecklist", value)}
          />
        </div>

        {/* Attachments Section */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-4">Attachments</label>
          <div className="flex flex-col gap-4">

            {/* Add Link */}
            <div className="flex gap-2">
              <input className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200" placeholder="Link URL (https://...)" value={linkInput} onChange={e => setLinkInput(e.target.value)} />
              <input className="w-1/3 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-[#0f172a] text-gray-800 dark:text-gray-200" placeholder="Link Name (Optional)" value={linkNameInput} onChange={e => setLinkNameInput(e.target.value)} />
              <button type="button" onClick={handleAddLink} className="bg-gray-100 dark:bg-gray-700 px-4 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">Add Link</button>
            </div>

            {/* Upload Files */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition" onClick={() => fileInputRef.current.click()}>
              <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <FaPaperclip className="mx-auto text-gray-400 text-xl mb-2" />
              <p className="text-sm text-gray-500">Click to upload files or images</p>
            </div>

            {/* Attachments List */}
            <div className="space-y-2">
              {taskData.attachments.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-2 truncate">
                    <FaLink className="text-blue-500" />
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-700 dark:text-blue-400 underline truncate">{link.name}</a>
                  </div>
                  <button onClick={() => removeAttachment(idx, 'link')} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                </div>
              ))}
              {taskData.files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 truncate">
                    <FaImage className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button onClick={() => removeAttachment(idx, 'file')} className="text-red-400 hover:text-red-600"><FaTrash /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#ff4d4f] hover:bg-[#ff7875] text-white font-bold py-3 px-8 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateTask;
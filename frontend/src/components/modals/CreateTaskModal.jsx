import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { MdClose, MdAdd, MdDeleteOutline, MdAssignment } from "react-icons/md";
import toast from "react-hot-toast";

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, users = [] }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        assignedTo: [], // Array of User IDs
    });

    const [subTaskInput, setSubTaskInput] = useState("");
    const [todoChecklist, setTodoChecklist] = useState([]);
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: "",
                description: "",
                priority: "Medium",
                dueDate: "",
                assignedTo: [],
            });
            setSubTaskInput("");
            setTodoChecklist([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddSubTask = (e) => {
        e.preventDefault();
        if (!subTaskInput.trim()) return;

        // Create a new sub-task object
        const newSubTask = { text: subTaskInput.trim(), completed: false };
        setTodoChecklist([...todoChecklist, newSubTask]);
        setSubTaskInput("");
    };

    const handleDeleteSubTask = (index) => {
        setTodoChecklist(todoChecklist.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // No validation for assignedTo needed here because Backend defaults to Self if empty

        setLoading(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                // assignedTo is already an array from the multi-select
                todoChecklist,
                assignmentType: formData.assignedTo?.length > 1 ? "group" : "individual",
            };

            await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload);

            toast.success("Task created successfully!");
            if (onTaskCreated) onTaskCreated(); // Refresh parent
            onClose();
        } catch (error) {
            console.error("Create task error:", error);
            toast.error(error.response?.data?.message || "Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Define tasks and assign responsibilities.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Task Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Redesign Homepage"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800 text-sm"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add details about the task..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-800 text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Assigned To (Multi-Select) */}
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Assign To <span className="text-xs font-normal text-gray-500 ml-1">(Hold Ctrl/Cmd to select multiple)</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="assignedTo"
                                    multiple
                                    value={formData.assignedTo || []} // Ensure it's an array for multi-select
                                    onChange={(e) => {
                                        const options = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData(prev => ({ ...prev, assignedTo: options }));
                                    }}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 text-sm cursor-pointer min-h-[100px]"
                                >
                                    {users.map((u) => (
                                        <option key={u._id} value={u._id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Leave empty to assign to yourself.</p>
                            </div>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 text-sm cursor-pointer"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 text-sm cursor-pointer"
                                required
                            />
                        </div>
                    </div>

                    {/* Sub-tasks Section */}
                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Action Items / Sub-tasks</label>

                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={subTaskInput}
                                onChange={(e) => setSubTaskInput(e.target.value)}
                                placeholder="Add a step (e.g., 'Draft Content')"
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm text-gray-800"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask(e)}
                            />
                            <button
                                type="button"
                                onClick={handleAddSubTask}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors border border-gray-200"
                            >
                                <MdAdd className="text-xl" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {todoChecklist.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100 group">
                                    <span className="text-sm text-gray-700">{item.text}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteSubTask(index)}
                                        className="text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <MdDeleteOutline className="text-lg" />
                                    </button>
                                </div>
                            ))}
                            {todoChecklist.length === 0 && (
                                <p className="text-xs text-center text-gray-400 py-2 italic">No sub-tasks added yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Task"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;

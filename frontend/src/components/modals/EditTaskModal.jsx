import React, { useEffect, useState, useContext } from 'react';
import Modal from '../Modal';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import { UserContext } from '../../context/userContext';
import SelectDropdown from '../inputs/SelectDropdown';
import { PRIORITY_DATA } from '../../utils/data';
import SelectUsers from '../inputs/SelectUsers';

const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('Pending');
    const [assignedTo, setAssignedTo] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'Medium');
            setStatus(task.status || 'Pending');
            // If assignedTo is populated (objects), map to IDs. If IDs, use as is.
            setAssignedTo(task.assignedTo?.map(u => u._id || u) || []);
        }
    }, [task]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updates = {
                title,
                description,
                priority,
                status,
                assignedTo
            };

            const response = await axiosInstance.put(`/api/tasks/${task._id}`, updates);
            toast.success("Task updated successfully");
            onTaskUpdated(response.data.updatedTask);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-input mt-1 block w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-input mt-1 block w-full"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <SelectDropdown
                            options={PRIORITY_DATA}
                            value={priority}
                            onChange={setPriority}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="form-input mt-1 block w-full"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <SelectUsers
                        selectedUsers={assignedTo}
                        setSelectedUsers={setAssignedTo}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-dark"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditTaskModal;

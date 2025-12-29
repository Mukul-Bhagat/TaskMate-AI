import React, { useState, useContext } from 'react';
import Modal from '../Model'; // Assuming Modal is exported as 'Modal' (or default) from ../Model.jsx
import axiosInstance from '../../utils/axiosInstance';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';

const CreateOrgModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const { refetchUser, switchOrganization } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/orgs/create', { name });
            const newOrg = response.data;

            toast.success("Organization Created!");

            // Refresh user profile to get the new membership
            await refetchUser();
            // Note: refetchUser is async behavior but might not be awaitable depending on implementation. 
            // Ideally we wait, but simpler flow:

            // Force switch (might need a slight delay or optimistic update if refetch is slow)
            // For now, let's just close and let the user see it in the sidebar or rely on refresh.
            // But better:
            // switchOrganization(newOrg._id); 

            onClose();
            setName("");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create organization");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Organization">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Organization Name
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Acme Corp"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateOrgModal;

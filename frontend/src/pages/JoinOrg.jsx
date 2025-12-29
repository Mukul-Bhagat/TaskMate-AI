import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import AuthLayout from '../components/layouts/AuthLayout';
import toast from 'react-hot-toast';

const JoinOrg = () => {
    const { inviteSlug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        setLoading(true);
        try {
            await axiosInstance.post(`/api/orgs/join/${inviteSlug}`);
            toast.success("Join request sent successfully!");
            navigate('/dashboard'); // Or some pending status page
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to join organization");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold mb-4">Join Organization</h2>
                <p className="text-slate-600 mb-8">
                    You have been invited to join an organization on TaskMate.
                </p>

                <button
                    onClick={handleJoin}
                    disabled={loading}
                    className="btn-primary w-full max-w-xs"
                >
                    {loading ? "Processing..." : "Request to Join"}
                </button>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 text-sm text-slate-500 hover:underline"
                >
                    Cancel
                </button>
            </div>
        </AuthLayout>
    );
};

export default JoinOrg;

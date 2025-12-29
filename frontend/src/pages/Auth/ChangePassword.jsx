import React, { useState } from 'react';
import AuthLayout from "../../components/layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import Input from "../../components/inputs/input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            const response = await axiosInstance.post('/api/auth/change-password', {
                oldPassword,
                newPassword
            });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                alert("Password Changed Successfully! Please login again.");
                navigate("/login"); // Force re-login or go to dashboard
            }

        } catch (err) {
            setError(err.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <AuthLayout>
            <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-black">Change Password</h3>
                <p className="text-xs text-slate-700 mt-[5px] mb-6">
                    For security, you must change your temporary password.
                </p>

                <form onSubmit={handleChangePassword}>
                    <Input
                        value={oldPassword}
                        onChange={({ target }) => setOldPassword(target.value)}
                        label="Current (Temporary) Password"
                        type="password"
                        placeholder="Enter the password from your email"
                    />

                    <Input
                        value={newPassword}
                        onChange={({ target }) => setNewPassword(target.value)}
                        label="New Password"
                        type="password"
                        placeholder="Min 6 characters"
                    />

                    <Input
                        value={confirmPassword}
                        onChange={({ target }) => setConfirmPassword(target.value)}
                        label="Confirm New Password"
                        type="password"
                        placeholder="Re-enter new password"
                    />

                    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                    <button type="submit" className="btn-primary mt-4">
                        Update Password
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default ChangePassword;

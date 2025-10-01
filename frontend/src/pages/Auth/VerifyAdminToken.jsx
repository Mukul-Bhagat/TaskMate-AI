import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Input from '../../components/inputs/input';
import toast from 'react-hot-toast';
import { useUserAuth } from '../../hooks/useUserAuth'; // Protect this page

const VerifyAdminToken = () => {
  useUserAuth(); // Ensures user is logged in to be on this page
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      return setError('Please enter an invite token.');
    }
    setError('');

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.VERIFY_ADMIN, {
        adminInviteToken: token,
      });

      // On success, update the user context with the new admin role and new token
      updateUser(response.data.user);
      localStorage.setItem('token', response.data.token); // Update token in storage
      
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    }
  };

  const handleSkip = () => {
    // If they skip, they proceed as a normal member
    navigate('/user/dashboard');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Admin Verification</h2>
        <p className="text-slate-600 mb-6">If you have an admin invite token, please enter it below to access admin features.</p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Admin Invite Token"
            value={token}
            onChange={({ target }) => setToken(target.value)}
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          <div className="flex items-center justify-between mt-6">
            <button type="button" onClick={handleSkip} className="text-sm text-slate-600 hover:underline">
              Continue as Member
            </button>
            <button type="submit" className="btn-primary">
              Verify & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyAdminToken;

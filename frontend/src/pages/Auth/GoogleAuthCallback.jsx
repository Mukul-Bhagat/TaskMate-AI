// frontend/src/pages/Auth/GoogleAuthCallback.jsx
import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const GoogleAuthCallback = () => {
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');

      if (token) {
        localStorage.setItem('token', token);
        
        try {
          const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
          const user = response.data;
          
          // Check if the user account was just created (e.g., within the last 60 seconds)
          const isNewUser = new Date() - new Date(user.createdAt) < 60000;

          if (isNewUser) {
            // This is a brand new user, send them to the verification page
            navigate('/verify-admin-token');
          } else {
            // This is an existing user, send them to their dashboard
            updateUser(user);
            if (user.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/user/dashboard');
            }
          }
        } catch (error) {
          // ... error handling
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleAuth();
  }, [navigate, searchParams, updateUser]);

  return <div>Loading, please wait...</div>;
};

export default GoogleAuthCallback;

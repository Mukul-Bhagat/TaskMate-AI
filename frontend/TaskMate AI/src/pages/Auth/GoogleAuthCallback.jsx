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
        // 1. Save the token to localStorage
        localStorage.setItem('token', token);

        // 2. Fetch the user's profile with the new token
        try {
          const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
          
          // 3. Update the global user state
          updateUser(response.data);

          // 4. Redirect to the correct dashboard based on role
          if (response.data.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        } catch (error) {
          console.error('Failed to fetch user profile after Google sign-in', error);
          navigate('/login'); // On failure, send back to login
        }
      } else {
        // No token was found in the URL
        console.error('Google sign-in failed, no token received.');
        navigate('/login');
      }
    };

    handleAuth();
  }, [navigate, searchParams, updateUser]);

  // Render a simple loading indicator while the logic runs
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <p>Loading, please wait...</p>
    </div>
  );
};

export default GoogleAuthCallback;
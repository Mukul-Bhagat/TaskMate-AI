import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const PrivateRoutes = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role Check
  if (allowedRoles && allowedRoles.length > 0) {
    // Derive role from user object (support both 'role' prop and memberships check)
    const userRole = user.role || (user.memberships?.[0]?.role) || 'member';

    if (!allowedRoles.includes(userRole)) {
      // If user is logged in but doesn't have permission
      return <Navigate to="/unauthorized" replace />; // Or redirect to their allowed home
    }
  }

  return <Outlet />;
};

export default PrivateRoutes;
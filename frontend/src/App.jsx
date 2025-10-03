import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all page components
import Dashboard from './pages/Admin/Dashboard';
import TaskMateLanding from './pages/Auth/TaskMateLanding';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp'; // Use the single, smart SignUp component
import CreateTask from './pages/Admin/CreateTask';
import ManageTasks from './pages/Admin/ManageTasks';
import ManageUsers from './pages/Admin/ManageUsers';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';
import MasterTaskView from './pages/Admin/MasterTaskView';
import GoogleAuthCallback from './pages/Auth/GoogleAuthCallback';
import VerifyAdminToken from './pages/Auth/VerifyAdminToken';

// Import functional components
import PrivateRoutes from './routes/PrivateRoutes';
import UserProvider, { UserContext } from './context/userContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<TaskMateLanding />} />
          <Route path="/login" element={<Login />} />
          {/* FIX #1: Both sign-up routes now use the same smart 'SignUp' component */}
          <Route path="/signup-admin" element={<SignUp />} />
          <Route path="/signup-member" element={<SignUp />} />
          <Route path="/start" element={<Root />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

          {/* Admin Private Routes */}
          <Route element={<PrivateRoutes allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/master-task/:id" element={<MasterTaskView />} />
          </Route>

          {/* User Private Routes */}
          {/* FIX #2: Changed allowed role from "user" to "member" */}
          <Route element={<PrivateRoutes allowedRoles={["member"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
          </Route>
          
          {/* FIX #3: Moved VerifyAdminToken to a route accessible by new members */}
          <Route element={<PrivateRoutes allowedRoles={["member", "admin"]} />}>
             <Route path="/verify-admin-token" element={<VerifyAdminToken />} />
          </Route>

        </Routes>
      </Router>
      <Toaster />
    </UserProvider>
  );
};

// This component handles the initial redirect after login
const Root = () => {
  const { user, loading } = useContext(UserContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === "admin" 
    ? <Navigate to="/admin/dashboard" /> 
    : <Navigate to="/user/dashboard" />;
};

export default App;

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Import all page components
import Dashboard from './pages/Admin/Dashboard';
import TaskMateLanding from './pages/Auth/TaskMateLanding';
import Login from './pages/Auth/Login';
import AdminSignUp from './pages/Auth/AdminSignUp';
import MemberSignUp from './pages/Auth/MemberSignUp';
import CreateTask from './pages/Admin/CreateTask';
import ManageTasks from './pages/Admin/ManageTasks';
import ManageUsers from './pages/Admin/ManageUsers';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';
import MasterTaskView from './pages/Admin/MasterTaskView';


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
          <Route path="/signup-admin" element={<AdminSignUp />} />
          <Route path="/signup-member" element={<MemberSignUp />} />
          <Route path="/start" element={<Root />} />

          {/* Admin Private Routes */}
          <Route element={<PrivateRoutes allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/master-task/:id" element={<MasterTaskView />} />
          </Route>

          {/* User Private Routes */}
          <Route element={<PrivateRoutes allowedRoles={["user"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            {/* FIX: Corrected the path to match what you are visiting */}
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
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
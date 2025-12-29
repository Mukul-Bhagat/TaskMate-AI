import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all page components
import Dashboard from './pages/Admin/Dashboard';
import TaskMateLanding from './pages/Auth/TaskMateLanding';
import SignIn from './pages/Auth/SignIn'; // Updated
import SignUp from './pages/Auth/SignUp'; // Updated
import Onboarding from './pages/Onboarding'; // New
import CreateTask from './pages/Admin/CreateTask';
import ManageTasks from './pages/Admin/ManageTasks';
import ManageUsers from './pages/Admin/ManageUsers';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from './pages/User/ViewTaskDetails';
import MasterTaskView from './pages/Admin/MasterTaskView';
import GoogleAuthCallback from './pages/Auth/GoogleAuthCallback';
import JoinOrg from './pages/JoinOrg';

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
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/join/:inviteSlug" element={<JoinOrg />} />

          {/* Protected Onboarding Route */}
          <Route element={<PrivateRoutes />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Org Dashboard Routes */}
          {/* Note: Roles are now organization-specific. The dashboard is shared logic-wise, 
              but access might differ. For now, assuming anyone with access can see dashboard. */}
          <Route element={<PrivateRoutes allowedRoles={["admin", "member"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Keeping old paths for compatibility or refactor them all to /dashboard later */}
            <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="/user/dashboard" element={<Navigate to="/dashboard" replace />} />

            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/master-task/:id" element={<MasterTaskView />} />

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

  // Logic updated for new flow
  if (!user.memberships || user.memberships.length === 0) {
    return <Navigate to="/onboarding" />;
  }
  return <Navigate to="/dashboard" />;
};

export default App;

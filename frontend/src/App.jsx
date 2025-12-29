import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserProvider from './context/userContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/layouts/DashboardLayout';
import { Toaster } from 'react-hot-toast'; // Preserving Toaster if user had it

import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import Dashboard from './pages/Admin/Dashboard';
import OrganizationTasks from './pages/Admin/OrganizationTasks';
import CreateTask from './pages/Admin/CreateTask';
import ManageUsers from './pages/Admin/ManageUsers';
import Analytics from './pages/Admin/Analytics';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <UserProvider>
        <ThemeProvider>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/register" element={<Navigate to="/signup" replace />} />

            {/* PROTECTED ROUTES (Wrapped in Layout) */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/organization/tasks" element={<OrganizationTasks />} />
              <Route path="/create-task" element={<CreateTask />} />

              {/* Admin / Management Routes */}
              <Route path="/organization/members" element={<ManageUsers />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

          </Routes>
          <Toaster position="top-right" />
        </ThemeProvider>
      </UserProvider>
    </Router>
  );
}

export default App;

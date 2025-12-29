import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideMenu from './SideMenu';
import Topbar from '../Topbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Main Container
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f172a] overflow-hidden transition-colors duration-300">

      {/* 1. LEFT: Sidebar */}
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 2. RIGHT: Content Area */}
      <div className="flex-1 flex flex-col h-full relative w-full overflow-hidden">

        {/* Top Header */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
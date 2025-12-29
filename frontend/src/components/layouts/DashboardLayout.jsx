
import React, { useState } from 'react';
import SideMenu from './SideMenu';
import Topbar from '../Topbar';

const DashboardLayout = ({ children, activeMenu }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300 overflow-hidden">

      {/* Sidebar (Passes state down) */}
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full">

        {/* Topbar needs to know how to open sidebar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-0 scroll-smooth">
          {children}
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
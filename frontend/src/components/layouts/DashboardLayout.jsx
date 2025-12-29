import React, { useContext, useState } from 'react';
import { UserContext } from '../../context/userContext';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import OrgSidebar from '../OrgSidebar';
import CreateOrgModal from '../modals/CreateOrgModal';

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* 1. Org Sidebar (Far Left) */}
      {user && (
        <OrgSidebar onOpenCreateModal={() => setIsModalOpen(true)} />
      )}

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar activeMenu={activeMenu} />

        {/* Inner Content (Sidebar + Page) */}
        {user && (
          <div className="flex flex-1 overflow-hidden">
            <div className="max-[1080px]:hidden h-full">
              <SideMenu activeMenu={activeMenu} />
            </div>

            <div className="grow mx-5 overflow-y-auto p-2">
              {children}
            </div>
          </div>
        )}
      </div>

      <CreateOrgModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
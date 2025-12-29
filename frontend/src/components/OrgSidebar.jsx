import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { useContext } from 'react';
import { LuPlus } from "react-icons/lu";

const OrgSidebar = ({ onOpenCreateModal }) => {
    const { user, activeOrg, switchOrganization } = useContext(UserContext);
    const navigate = useNavigate();

    if (!user || !user.memberships) return null;

    return (
        <div className="w-16 flex flex-col items-center py-4 bg-gray-100 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen overflow-y-auto">
            <div className="space-y-4">
                {user.memberships.map((membership) => {
                    // Handle populated vs unpopulated org ID
                    const org = membership.organizationId; // Assuming populated from backend
                    const orgId = org._id || org;
                    const orgName = org.name || "Org"; // Fallback
                    const isActive = activeOrg && (activeOrg.organizationId._id === orgId || activeOrg.organizationId === orgId);

                    return (
                        <div key={orgId} className="relative group">
                            {/* Left indicator for active state */}
                            {isActive && (
                                <div className="absolute -left-4 top-2 h-8 w-1 bg-primary rounded-r-lg"></div>
                            )}

                            <button
                                onClick={() => {
                                    switchOrganization(orgId);
                                    navigate('/dashboard'); // Optional: redirect to dashboard on switch
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200
                  ${isActive
                                        ? 'bg-primary text-white rounded-xl'
                                        : 'bg-white text-slate-700 hover:bg-primary/20 hover:text-primary hover:rounded-xl shadow-sm'
                                    }
                `}
                                title={orgName}
                            >
                                {orgName.charAt(0).toUpperCase()}
                            </button>
                        </div>
                    );
                })}

                {/* Create Org Button */}
                <button
                    onClick={onOpenCreateModal}
                    className="w-10 h-10 rounded-full bg-slate-200 hover:bg-green-500 hover:text-white flex items-center justify-center text-slate-500 transition-all duration-200 group"
                    title="Create Organization"
                >
                    <LuPlus className="text-xl" />
                </button>
            </div>
        </div>
    );
};

export default OrgSidebar;

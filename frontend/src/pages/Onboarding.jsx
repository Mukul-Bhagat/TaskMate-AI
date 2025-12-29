import React, { useState } from "react";
import AuthLayout from "../components/layouts/AuthLayout";
import CreateOrgModal from "../components/modals/CreateOrgModal";
import { LuBuilding, LuMail } from "react-icons/lu";

const Onboarding = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AuthLayout>
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <h1 className="text-3xl font-bold mb-2">Welcome to TaskMate!</h1>
                <p className="text-slate-600 mb-10 max-w-md">
                    You aren't a member of any organization yet. To get started, you can either create your own workspace or ask for an invite.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Create Workspace Card */}
                    <div
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center group"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                            <LuBuilding className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Create Workspace</h3>
                        <p className="text-sm text-gray-500">
                            Set up a new organization for your team and start collaborating.
                        </p>
                    </div>

                    {/* Join Workspace / Invite Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <LuMail className="text-3xl" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Join Workspace</h3>
                        <p className="text-sm text-gray-500">
                            Ask your admin for an <b>Invite Link</b> to join an existing team.
                        </p>
                    </div>
                </div>

                <CreateOrgModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </AuthLayout>
    );
};

export default Onboarding;

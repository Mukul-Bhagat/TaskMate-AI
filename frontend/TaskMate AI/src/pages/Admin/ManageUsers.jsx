import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet, LuPlus } from "react-icons/lu"; // Added LuPlus
import UserCard from "../../components/Cards/UserCard";
import Modal from "../../components/Model"; // Import the Modal
import Input from "../../components/inputs/input"; // Import the Input
import toast from "react-hot-toast"; // Import toast for notifications

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  
  // --- NEW STATE FOR THE INVITE MODAL ---
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  
  // --- NEW FUNCTION TO SEND THE INVITE ---
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.USERS.INVITE_USER, { email: inviteEmail });
      toast.success(`Invite sent successfully to ${inviteEmail}`);
      setIsInviteModalOpen(false); // Close modal on success
      setInviteEmail(""); // Clear the input
      getAllUsers(); // Refresh the user list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invite.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    // ... your existing download report logic is perfect
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">Team Members</h2>
          
          {/* --- UPDATED HEADER BUTTONS --- */}
          <div className="flex items-center gap-4">
            <button
              className="add-btn"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <LuPlus /> Invite User
            </button>
            <button className="download-btn" onClick={handleDownloadReport}>
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {allUsers?.map((user) => (
            <UserCard key={user._id} userInfo={user} />
          ))}
        </div>
      </div>
      
      {/* --- NEW INVITE USER MODAL --- */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New User"
      >
        <form onSubmit={handleSendInvite}>
          <p className="text-sm text-slate-600 mb-4">
            Enter the email address of the user you want to invite. They will receive an email with instructions to set up their account.
          </p>
          <Input
            value={inviteEmail}
            onChange={({ target }) => setInviteEmail(target.value)}
            label="Email Address"
            placeholder="user@example.com"
            type="email"
          />
          <div className="flex justify-end mt-6">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </Modal>

    </DashboardLayout>
  );
};

export default ManageUsers;
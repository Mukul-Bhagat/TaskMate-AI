import React, { useEffect, useState } from "react";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { LuUsers } from "react-icons/lu"; // Added based on JSX
import Modal from "../Modal";
import AvatarGroup from "../layouts/AvatarGroup";

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

  // Fetches users for the current organization
  const getAllUsers = async () => {
    try {
      const activeOrgId = localStorage.getItem("activeOrgId");
      if (!activeOrgId) return; // Should handle this case UI-wise

      const response = await axiosInstance.get(`/api/orgs/${activeOrgId}/members`);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Adds or removes a user from the temporary selection
  const toggleUserSelection = (userId) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Confirms the selection and closes the modal
  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

  // Derives the avatar URLs for currently selected users
  const selectedUserAvatars = allUsers
    .filter((user) => selectedUsers.includes(user._id))
    .map((user) => user.profileImageUrl);

  // Effect to fetch users when the component mounts
  useEffect(() => {
    getAllUsers();
  }, []);

  // Effect to sync the temporary selection when the parent's selection changes
  useEffect(() => {
    if (selectedUsers.length === 0) {
      setTempSelectedUsers([]);
    }
  }, [selectedUsers]);

  return (
    <div className="space-y-4 mt-2">
      {/* Display avatars of selected users here (code not shown in screenshots) */}

      {/* "Add Members" button, shown when no one is selected */}

      {selectedUserAvatars.length === 0 && (
        <button
          className="card-btn"
          onClick={() => setIsModalOpen(true)}>
          <LuUsers className="text-sm" /> Add Members
        </button>
      )}

      {selectedUserAvatars.length > 0 && (
        <div
          className="cursor-pointer"
          onClick={() => setIsModalOpen(true)}>
          <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
        </div>
      )}


      {/* The Modal for selecting users would be here (code not shown in screenshots) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign To :"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        </div>
        <div>
          {allUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between gap-4 p-3 border-b border-gray-200"
            >

              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="text-[13px] text-gray-600">{user.email}</p>
              </div>


              <input
                type="checkbox"
                checked={tempSelectedUsers.includes(user._id)}
                onChange={() => toggleUserSelection(user._id)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            className="card-btn"
            onClick={() => setIsModalOpen(false)}
          >
            CANCEL
          </button>
          <button
            className="card-btn-fill"
            onClick={handleAssign}
          >
            DONE
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SelectUsers;
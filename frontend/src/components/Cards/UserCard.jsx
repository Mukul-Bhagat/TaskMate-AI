import React from 'react';

const UserCard = ({ userInfo }) => {
  return (
    <div className="card"> {/* Assuming you have a .card class for styling */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={userInfo?.profileImageUrl || null}
            alt={userInfo?.name || 'Avatar'}
            className="w-12 h-12 rounded-full object-cover bg-slate-200"
          />
          <div>
            <p className="text-sm font-medium">{userInfo?.name}</p>
            <p className="text-xs text-gray-500">{userInfo?.email}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 mt-4 border-t border-slate-200 pt-4">
        {/* FIX 1: Changed to uppercase <StatCard /> */}
        <StatCard
          label="Pending"
          count={userInfo?.pendingTasks || 0}
          status="Pending"
        />
        <StatCard
          label="In Progress"
          count={userInfo?.inProgressTasks || 0}
          status="In Progress"
        />
        <StatCard
          label="Completed"
          // FIX 2: Corrected typo from "compltedTasks"
          count={userInfo?.completedTasks || 0}
          status="Completed"
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, count, status }) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "In Progress":
        return "text-cyan-600";
      case "Completed":
        return "text-lime-600";
      default: // For "Pending"
        return "text-violet-600";
    }
  };

  return (
    <div className="text-center">
      <p className={`font-semibold ${getStatusTagColor()}`}>{count}</p>
      {/* FIX 3: Added the label to be displayed */}
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
};

export default UserCard;
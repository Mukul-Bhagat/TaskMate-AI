import React from "react";

const DeleteAlert = ({ content, onDelete, onClose }) => {
  return (
    <div>
      <p className="text-sm text-slate-600">{content}</p>

      <div className="flex justify-end items-center gap-4 mt-6">
        <button
          type="button"
          className="card-btn"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-white whitespace-nowrap bg-rose-500 rounded-lg px-4 py-2 cursor-pointer hover:bg-rose-600"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Ensure this line is at the bottom of the file
export default DeleteAlert;
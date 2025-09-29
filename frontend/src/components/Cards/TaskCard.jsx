import React from "react";
import moment from "moment";
import { LuPaperclip } from "react-icons/lu";
import Progress from "../layouts/progress";
import AvatarGroup from "../layouts/AvatarGroup"

const TaskCard = ({
  title,
  description,
  priority,
  status,
  progress,
  createdAt,
  dueDate,
  assignedTo,
  attachmentCount,
  completedTodoCount,
  todoChecklist,
  onClick,
}) => {
  // Helper to get Tailwind classes for the status tag
  const getStatusTagColor = () => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      default: // Pending
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  // Helper to get Tailwind classes for the priority tag
  const getPriorityTagColor = () => {
    switch (priority) {
      case "Low":
        return "text-emerald-500 bg-emerald-50 border border-emerald-500/10";
      case "Medium":
        return "text-amber-500 bg-amber-50 border border-amber-500/10";
      default: // High
        return "text-rose-500 bg-rose-50 border border-rose-500/10";
    }
  };

  // Helper to get the border color for the main content
  const getStatusBorderColor = () => {
    switch (status) {
      case "In Progress":
        return "border-cyan-500";
      case "Completed":
        return "border-indigo-500";
      default: // Pending
        return "border-violet-500";
    }
  };

  return (
    <div
      className="bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 cursor-pointer"
      onClick={onClick}
    >
      {/* Header: Status & Priority Tags */}
      <div className="flex items-end gap-3 px-4">
        <div className={`text-[11px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded-full`}>
          {status}
        </div>
        <div className={`text-[11px] font-medium ${getPriorityTagColor()} px-4 py-0.5 rounded-full`}>
          {priority} Priority
        </div>
      </div>

      {/* Main Content */}
      <div className={`px-4 border-l-[3px] ${getStatusBorderColor()}`}>
        <p className="text-sm font-medium text-gray-800 mt-4 line-clamp-2">
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-[18px]">
          {description}
        </p>
        <p className="text-[13px] text-gray-700/80 font-medium mt-2 mb-2 leading-[18px]">
          Task Done:{" "}
          <span className="font-semibold text-gray-700">
            {completedTodoCount} / {todoChecklist.length || 0}
          </span>
        </p>
        <Progress progress={progress} status={status} />
      </div>

      {/* Dates Section */}
      <div className="px-4 flex items-center justify-between my-1">
        <div>
          <label className="text-xs text-gray-500">Start Date</label>
          <p className="text-[13px] font-medium text-gray-900">
            {moment(createdAt).format("Do MMM YYYY")}
          </p>
        </div>
        <div>
          <label className="text-xs text-gray-500">Due Date</label>
          <p className="text-[13px] font-medium text-gray-900">
            {moment(dueDate).format("Do MMM YYYY")}
          </p>
        </div>
      </div>

      {/* Footer: Avatars & Attachments */}
      <div className="flex items-center justify-between mt-3 px-4">
        <AvatarGroup avatars={assignedTo || []} />
        {attachmentCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg">
            <LuPaperclip className="text-primary" />
            <span className="text-xs text-gray-900">{attachmentCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
import { MdDashboard, MdAssignment, MdGroup, MdAnalytics } from "react-icons/md";

export const SIDE_MENU_DATA = [
  { label: "Dashboard", path: "/dashboard", icon: MdDashboard },
  { label: "Manage Tasks", path: "/manage-tasks", icon: MdAssignment },
  { label: "Manage Users", path: "/manage-users", icon: MdGroup },
  { label: "Performance Analytics", path: "/analytics", icon: MdAnalytics },
];

export const SIDE_MENU_USER_DATA = [
  { label: "Dashboard", path: "/dashboard", icon: MdDashboard },
  { label: "My Tasks", path: "/user/tasks", icon: MdAssignment },
  { label: "Analytics", path: "/analytics", icon: MdAnalytics },
];

export const PRIORITY_DATA = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

export const STATUS_DATA = [
  { label: "Pending", value: "Pending" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
];
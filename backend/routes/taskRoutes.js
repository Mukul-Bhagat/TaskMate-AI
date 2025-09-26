const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const {
  getDashboardData,
  getUserDashboardData,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getMasterTaskDetails,
  deleteMasterTask,
  scheduleTaskOnCalendar,
} = require("../controllers/taskController");

const router = express.Router();

// Task Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", protect, getTaskById); // Get task by ID
router.post("/", protect, adminOnly, createTask); // Create a task (Admin only)
router.put("/:id", protect, updateTask); // Update task details
router.delete("/:id", protect, adminOnly, deleteTask); // Delete a task (Admin only)
router.put("/:id/status", protect, updateTaskStatus); // Update task status
router.put("/:id/todo", protect, updateTaskChecklist); // Update task checklist
router.get("/master/:id", protect, adminOnly, getMasterTaskDetails); //Get Individual all tasks
router.delete("/master/:id", protect, adminOnly, deleteMasterTask);
router.post("/:id/schedule", protect, scheduleTaskOnCalendar);

module.exports = router;
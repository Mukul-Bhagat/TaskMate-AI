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
  reviewTask,
  getMyOrganizationTasks,
  getAllOrganizationTasks,
} = require("../controllers/taskController");

const router = express.Router();

const upload = require('../middlewares/uploadMiddleware'); // Import upload middleware

// Task Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/my-tasks", protect, getMyOrganizationTasks); // Get assigned tasks for logged-in user (Secure)
router.get("/", protect, getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", protect, getTaskById); // Get task by ID

// Updated to handle file uploads
router.post("/", protect, adminOnly, upload.array('files'), createTask);

router.put("/:id", protect, updateTask); // Update task details
router.delete("/:id", protect, adminOnly, deleteTask); // Delete a task (Admin only)
router.put("/:id/status", protect, updateTaskStatus); // Update task status
router.put("/:id/todo", protect, updateTaskChecklist); // Update task checklist
router.get("/master/:id", protect, adminOnly, getMasterTaskDetails); //Get Individual all tasks
router.delete("/master/:id", protect, adminOnly, deleteMasterTask);
router.post("/:id/schedule", protect, scheduleTaskOnCalendar);
router.put("/:id/review", protect, adminOnly, reviewTask);
router.get("/organization", protect, adminOnly, getAllOrganizationTasks); // Note: Route path conflict. Fixed by order? 
// Actually 'organization' vs ':id' usually causes issues if ':id' is generic.
// However express matches exact string "organization" before ":id" if defined first? No, define specific routes FIRST.
// "organization" does not look like an ID, but it's safer to move it up or rename.
// Current order: /organization matches /:id ? No, let's move /organization UP to avoid ambiguity.

module.exports = router;
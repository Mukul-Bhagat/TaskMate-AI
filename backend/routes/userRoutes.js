const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const {
  getUsers,
  getUserById,
  deleteUser, // Now it will be used
  inviteUser,
} = require("../controllers/userController");
const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, getUserById);
router.post("/invite", protect, adminOnly, inviteUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;                                                                                                     

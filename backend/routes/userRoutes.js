const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const {
  getUsers,
  getUserById,
  deleteUser, // Now it will be used
  inviteUser,
  getOrganizationMembers,
  addMember,
  bulkImportUsers
} = require("../controllers/userController");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temp folder

// User Management Routes
router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, getUserById);
router.post("/invite", protect, adminOnly, inviteUser);
router.get("/organization-members", protect, getOrganizationMembers);
router.post("/add-member", protect, adminOnly, addMember);
router.post("/bulk-import", protect, adminOnly, upload.single('file'), bulkImportUsers);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;                                                                                                     

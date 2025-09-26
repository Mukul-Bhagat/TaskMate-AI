const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

// FIX: Combined all controller imports into one line
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  googleAuth,
  googleAuthCallback,
} = require("../controllers/authController");

// --- Auth Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// --- Google Calendar Routes ---
router.get("/google", protect, googleAuth);
router.get("/google/callback", googleAuthCallback);

// --- Image Upload Route ---
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// FIX: Removed the duplicate export
module.exports = router;
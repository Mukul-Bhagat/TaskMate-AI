const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();
const passport = require('passport');

// FIX: Added generateToken to the import list
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  generateToken, // <-- IMPORT THIS
} = require("../controllers/authController");

// --- USER AUTH ROUTES ---
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/upload-image", upload.single("image"), (req, res) => {
  // ... your image upload logic
});

// --- GOOGLE SIGN-IN ROUTES ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // This will now work because generateToken is imported
    const token = generateToken(req.user.id);
    res.redirect(`http://localhost:5173/auth/google/callback?token=${token}`);
  }
);

module.exports = router;
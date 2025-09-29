const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();
const passport = require('passport');

// Import controller functions
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  generateToken,
} = require("../controllers/authController");

// --- USER AUTH ROUTES ---
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// --- IMAGE UPLOAD ROUTE (Public for Sign-Up) ---
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// --- GOOGLE SIGN-IN ROUTES ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // On success, Passport attaches the user to req.user
    const token = generateToken(req.user.id);
    // Redirect back to your frontend, passing the token in the URL
    res.redirect(`http://localhost:5173/auth/google/callback?token=${token}`);
  }
);

module.exports = router;
// backend/routes/googleApiRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
// Note: We assume googleAuth and googleAuthCallback are now in a separate controller
const {
  googleAuth,
  googleAuthCallback,
} = require("../controllers/googleApiController");

// FIX: Use a unique path like /auth/calendar
router.get("/auth/calendar", protect, googleAuth);

// The callback URI must be updated in your Google Cloud Console to match this
router.get("/auth/calendar/callback", googleAuthCallback);

module.exports = router;
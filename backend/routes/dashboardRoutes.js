const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// Only Admins should see the full dashboard (or all users? Users prompt says "Admin Dashboard", code has `auth` middleware. I'll use `protect`.)
router.get('/stats', protect, dashboardController.getDashboardStats);

module.exports = router;

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const crypto = require('crypto'); // Import crypto
const nodemailer = require('nodemailer'); // Import nodemailer

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      // No default role/memberships. They are "org-less" until they join one.
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      memberships: user.memberships,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
      message: "Registration successful"
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('memberships.organizationId');

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      memberships: user.memberships,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Redirects user to Google for authentication
const googleAuth = (req, res) => {
  const { taskId } = req.query; // Get taskId if passed from frontend

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // FIX: Pass the logged-in user's ID and the taskId in the 'state' parameter
  const state = JSON.stringify({ userId: req.user.id, taskId });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: state, // Pass the state
  });

  res.redirect(authUrl);
};

// @desc    Handles the callback from Google OAuth
// @desc    Handles the callback from Google OAuth
const googleAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.status(400).send("Error: Google authentication failed.");
  }

  try {
    const { userId, taskId } = JSON.parse(state || "{}");
    if (!userId) {
      return res.status(400).send("Error: User identification failed.");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;

    const user = await User.findById(userId);
    if (user) {
      user.googleAccessToken = access_token;
      user.googleRefreshToken = refresh_token;
      user.googleTokenExpiry = new Date(expiry_date);
      await user.save();
    }

    // Redirect the user back to the task page they started from
    // In production, these should use process.env.CLIENT_URL
    if (taskId) {
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/user/task-details/${taskId}`);
    } else {
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/user/dashboard`);
    }

  } catch (error) { // <-- THIS BLOCK WAS MISSING
    console.error("Error during Google callback:", error);
    res.status(500).send("Error: Could not process Google callback.");
  }
};

// @desc    Verify admin invite token and upgrade user role
// @route   POST /api/auth/verify-admin
// @access  Private
const verifyAdminToken = async (req, res) => {
  try {
    const { adminInviteToken } = req.body;
    const userId = req.user.id; // Get user ID from the 'protect' middleware

    // Check if the provided token is correct
    if (adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
      // Find the user and update their role to "admin"
      const user = await User.findByIdAndUpdate(
        userId,
        { role: 'admin' },
        { new: true } // Return the updated document
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a new token with the updated role
      const token = generateToken(user._id);

      // Send back the updated user data and new token
      res.json({
        message: 'Admin verification successful!',
        user,
        token,
      });
    } else {
      // If token is incorrect
      return res.status(400).json({ message: 'Invalid Admin Invite Token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add this new function to authController.js
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send('<h1>Error</h1><p>Invalid or expired verification link.</p>');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to the login page on your frontend
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login`);
  } catch (error) {
    res.status(500).send('<h1>Error</h1><p>An error occurred while verifying your email.</p>');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  googleAuth,
  googleAuthCallback,
  generateToken,
  verifyAdminToken,
  verifyEmail,
};

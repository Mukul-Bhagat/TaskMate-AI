const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    let role = "member";
    if (adminInviteToken && adminInviteToken.trim() === process.env.ADMIN_INVITE_TOKEN) {
      role = "admin";
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword, profileImageUrl, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
      role: user.role,
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
const googleAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.status(400).send("Error: Google authentication failed.");
  }
  try {
    // FIX: Get the userId and taskId back from the 'state' parameter
    const { userId, taskId } = JSON.parse(state || "{}");

    if (!userId) {
      return res.status(400).send("Error: User identification failed.");
    }

    const oauth2Client = new google.auth.OAuth2(/* ... your credentials ... */);
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;

    // FIX: Find the correct user by their ID and save the tokens
    const user = await User.findById(userId);
    if (user) {
      user.googleAccessToken = access_token;
      user.googleRefreshToken = refresh_token;
      user.googleTokenExpiry = new Date(expiry_date);
      await user.save();
    }

    // Redirect the user back to the task page they started from
    if (taskId) {
      res.redirect(`http://localhost:5173/user/task-details/${taskId}`);
    } else {
      res.redirect(`http://localhost:5173/user/dashboard`);
    }

  } catch (error) {
    // ... error handling
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
};
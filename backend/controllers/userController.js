const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // Built-in Node.js module

// @desc    Get all users (Admin only)
// @route   GET /api/users/
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    // 1. Find all users with the role of "member" and exclude their passwords
    const users = await User.find({ role: "member" }).select("-password");

    // 2. Add task counts to each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        // Count tasks with "Pending" status for the current user
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Pending",
        });

        // Count tasks with "In Progress" status for the current user
        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "In Progress",
        });

        // Count tasks with "Completed" status for the current user
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        });

        // Return a new object combining the user's data with their task counts
        return {
          ...user._doc, // Include all existing user data
          pendingTasks,
          inProgressTasks,
          completedTasks,
        };
      })
    );
    res.status(200).json(usersWithTaskCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    // Find the user by the ID from the URL parameters and exclude the password
    const user = await User.findById(req.params.id).select("-password");
    
    // If no user is found with that ID, return a 404 error
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // If the user is found, send their data as the response
    res.json(user);
    
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// In controllers/userController.js

// ... your other functions (registerUser, loginUser, etc.)

// @desc    Invite a new user (Admin only)
// @route   POST /api/users/invite
// @access  Private (Admin)
const inviteUser = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 2. Generate a temporary random password
    const temporaryPassword = crypto.randomBytes(8).toString("hex");

    // 3. Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    // 4. Create the new user
    const newUser = await User.create({
      name: "Invited User", // A placeholder name
      email,
      password: hashedPassword,
      createdBy: req.user.id, // Link to the admin who invited them
      // You could add an inviteToken and status if your schema supports it
    });

    // 5. TODO: Send an invitation email
    // Here, you would use a service like Nodemailer or SendGrid
    // to send the user an email with their temporary password
    // and a link to log in.
    console.log(`
      INVITATION EMAIL SIMULATION:
      To: ${email}
      Subject: You've been invited to TaskMate!
      Body: Welcome! Your temporary password is: ${temporaryPassword}
      Please log in and change your password.
    `);

    res.status(201).json({ message: `Invitation sent successfully to ${email}` });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Optional: Add logic to re-assign or delete tasks associated with this user
    
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  inviteUser,
};
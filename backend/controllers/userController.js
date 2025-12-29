const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require('fs');
const csv = require('csv-parser');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all users (Admin only)
// @route   GET /api/users/
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "member" }).select("-password");
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Pending",
        });
        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "In Progress",
        });
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        });
        return {
          ...user._doc,
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
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
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
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Invite a new user (Admin only)
// @route   POST /api/users/invite
// @access  Private (Admin)
const inviteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please provide an email." });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "A user with this email already exists." });

    const name = email.split('@')[0];
    const tempPassword = Math.random().toString(36).slice(-8);

    await User.create({
      name,
      email,
      password: tempPassword,
      role: 'member',
    });

    res.status(201).json({ message: `User invited and account created for ${email}.` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get organization members
// @route   GET /api/users/organization-members
// @access  Private
const getOrganizationMembers = async (req, res) => {
  try {
    const organizationId = req.headers['x-org-id'];

    if (!organizationId) {
      // Fallback: If no header, return members of the first org the user is part of (or empty)
      // This prevents 500 error, but ideally frontend sends the header.
      return res.status(400).json({ msg: "Organization Context Missing" });
    }

    // Find users who have a membership in this organization
    const members = await User.find({
      "memberships.organizationId": organizationId
    }).select('-password');

    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add a new member to the organization (Email Only)
// @route   POST /api/users/add-member
// @access  Private (Admin)
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    // Ensure we have an organization ID
    const organizationId = req.headers['x-org-id'];
    if (!organizationId) {
      return res.status(400).json({ msg: "Organization Context Missing" });
    }

    // 1. Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Check if already in THIS org
      const alreadyMember = user.memberships.some(m => m.organizationId.toString() === organizationId.toString());
      if (alreadyMember) {
        return res.status(400).json({ msg: 'User already exists in this organization' });
      }

      // Add to org
      user.memberships.push({ organizationId, role: 'member' });
      await user.save();

      return res.json(user);
    }

    // 2. Create New User
    const name = email.split('@')[0];
    const password = Math.random().toString(36).slice(-8); // Random 8-char password

    user = new User({
      name,
      email,
      memberships: [{ organizationId, role: 'member' }],
      password // Set password initially
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Send Invite Email with Creds
    try {
      await sendEmail(email, name, password);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    res.json(user);
  } catch (err) {
    console.error("Add Member Error:", err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Bulk Import Users (Email CSV)
// @route   POST /api/users/bulk-import
// @access  Private (Admin)
const bulkImportUsers = async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const results = [];
  const errors = [];
  const organizationId = req.headers['x-org-id'];

  if (!organizationId) {
    return res.status(400).json({ msg: "Organization Context Missing" });
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        try {
          // Flexible column matching
          const email = row.Email || row.email || row.EMAIL || Object.values(row)[0];
          if (!email || !email.includes('@')) continue;

          let user = await User.findOne({ email });

          if (user) {
            const alreadyMember = user.memberships.some(m => m.organizationId.toString() === organizationId.toString());
            if (!alreadyMember) {
              user.memberships.push({ organizationId, role: 'member' });
              await user.save();
            } else {
              errors.push(`Skipped ${email}: Already in organization`);
            }
            continue;
          }

          const name = email.split('@')[0];
          const password = Math.random().toString(36).slice(-8);

          const newUser = new User({
            name,
            email,
            memberships: [{ organizationId, role: 'member' }],
            password // Set initial password
          });

          const salt = await bcrypt.genSalt(10);
          newUser.password = await bcrypt.hash(password, salt);
          await newUser.save();

          try {
            await sendEmail(email, name, password);
          } catch (e) { console.error("Email failed for", email); }

        } catch (err) {
          console.error(err);
          errors.push(`Error adding row`);
        }
      }

      try {
        fs.unlinkSync(req.file.path);
      } catch (e) { console.error("Error deleting temp file", e); }

      res.json({ msg: "Import processed", count: results.length, errors });
    });
};

module.exports = {
  getUsers,
  getUserById,
  deleteUser,
  inviteUser,
  getOrganizationMembers,
  addMember,
  bulkImportUsers
};

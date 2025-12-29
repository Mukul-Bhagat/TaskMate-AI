const Task = require("../models/Task");
const User = require("../models/User");
const { google } = require("googleapis");

// @desc    Get all tasks (Admin: all, User: only assigned tasks)
// @route   GET /api/tasks/
// @access  Private
// In your backend's taskController.js

const getTasks = async (req, res) => {
  try {
    const { status, sort, assignedTo } = req.query;
    let statusFilter = {};

    // Only apply a status filter if it's not "All"
    if (status && status !== "All") {
      statusFilter.status = status;
    }

    // --- UPDATED LOGIC ---

    // 1. Define a base filter for the user's role AND Organization
    const organizationId = req.headers['x-org-id'];
    let baseUserFilter = {};

    // Standard Logic
    if (req.user.role === "admin") {
      baseUserFilter = { createdBy: req.user._id };
    } else {
      baseUserFilter = { assignedTo: req.user._id };
    }

    // Override if "assignedTo=me" explicitly requested (e.g. for Admin Dashboard Widget)
    if (assignedTo === 'me') {
      baseUserFilter = { assignedTo: req.user._id };
    }

    // Org Filter
    if (organizationId) {
      baseUserFilter.organizationId = organizationId;
    }

    // 2. If the user is an admin AND NOT filtering by "assignedTo=me", add the parentTask filter
    // This ensures they only see master/group tasks in the main list
    if (req.user.role === "admin" && assignedTo !== 'me') {
      baseUserFilter.parentTask = null;
    }

    // 3. The rest of the function now works with the correct filters
    const finalFilterForList = { ...baseUserFilter, ...statusFilter };

    let query = Task.find(finalFilterForList).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    // Apply Sorting
    if (sort === "dueDate") {
      query = query.sort({ dueDate: 1 }); // Ascending (earliest first)
    } else {
      query = query.sort({ createdAt: -1 }); // Default new first
    }

    let tasks = await query;

    // This part of your code is perfect
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return { ...task._doc, completedTodoCount: completedCount };
      })
    );

    // The counts will also be correct now because they use the updated baseUserFilter
    const allTasks = await Task.countDocuments(baseUserFilter);
    const pendingTasks = await Task.countDocuments({
      ...baseUserFilter,
      status: "Pending",
    });
    const inProgressTasks = await Task.countDocuments({
      ...baseUserFilter,
      status: "In Progress",
    });
    const completedTasks = await Task.countDocuments({
      ...baseUserFilter,
      status: "Completed",
    });

    // --- END OF UPDATES ---

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    ).populate("todoChecklist.completedBy", "name profileImageUrl");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new task (Admin only)
// @route   POST /api/tasks/
// @access  Private (Admin)
// In controllers/taskController.js

// In controllers/taskController.js

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, todoChecklist, assignmentType } = req.body;
    let { attachments } = req.body;

    // 1. Get Context
    const creatorId = req.user._id;
    const organizationId = req.headers['x-org-id'];

    if (!organizationId) {
      return res.status(400).json({ message: "Organization Context Missing" });
    }

    // 2. Process Attachments
    const finalAttachments = [];

    // a. Parse Links (sent as JSON string or array in body)
    if (attachments) {
      try {
        const parsedLinks = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
        if (Array.isArray(parsedLinks)) {
          parsedLinks.forEach(link => {
            if (link.type === 'link') finalAttachments.push(link);
          });
        }
      } catch (e) {
        console.error("Error parsing attachment links", e);
      }
    }

    // b. Process Uploaded Files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        finalAttachments.push({
          type: 'file',
          url: `/uploads/${file.filename}`, // Assuming local uploads served statically
          name: file.originalname
        });
      });
    }

    // 3. Handle Assignments
    let finalAssignees = [];

    if (assignmentType === 'me') {
      finalAssignees = [creatorId];
    } else {
      // 'group' or 'individual'
      if (typeof assignedTo === 'string') {
        // If comma separated or single ID
        finalAssignees = assignedTo.split(',').filter(id => id.trim().length > 0);
      } else if (Array.isArray(assignedTo)) {
        finalAssignees = assignedTo;
      }

      // Security Check for Assignees
      if (finalAssignees.length > 0) {
        const validUsersCount = await User.countDocuments({
          _id: { $in: finalAssignees },
          "memberships.organizationId": organizationId
        });
        if (validUsersCount !== finalAssignees.length) {
          return res.status(403).json({ message: "Cannot assign tasks to users outside your organization." });
        }
      } else {
        // Default to creator if empty (optional, or throw error)
        finalAssignees = [creatorId];
      }
    }

    // 4. Create Task
    // Parse Todo Checklist if it's a string (FormData quirks)
    let parsedChecklist = todoChecklist;
    if (typeof todoChecklist === 'string') {
      try {
        parsedChecklist = JSON.parse(todoChecklist);
      } catch (e) { parsedChecklist = []; }
    }

    const newTask = new Task({
      title,
      description,
      priority: priority || 'Medium',
      status: 'Pending',
      organizationId,
      assignedTo: finalAssignees,
      createdBy: creatorId,
      dueDate,
      todoChecklist: parsedChecklist || [],
      attachments: finalAttachments,
      assignmentType: assignmentType || 'group'
    });

    const task = await newTask.save();
    await task.populate("assignedTo", "name email profileImageUrl");

    res.status(201).json(task);

  } catch (err) {
    console.error("Error in createTask:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
// In controllers/taskController.js

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const organizationId = req.headers['x-org-id'];

    if (task.organizationId && task.organizationId.toString() !== organizationId) {
      return res.status(403).json({ message: "Access denied: Task belongs to another organization" });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const updates = req.body;

    // Update the main task
    Object.assign(task, updates);
    const updatedTask = await task.save();

    // --- NEW LOGIC: If this is a master task, update its children ---
    if (updatedTask.assignmentType === "individual") {
      // Create an object with only the fields that should be synced
      const syncedUpdates = {
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        priority: updatedTask.priority,
      };
      await Task.updateMany({ parentTask: updatedTask._id }, { $set: syncedUpdates });
    }
    // --- END NEW LOGIC ---

    res.json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a Task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const organizationId = req.headers['x-org-id'];

    if (task.organizationId && task.organizationId.toString() !== organizationId) {
      return res.status(403).json({ message: "Access denied: Task belongs to another organization" });
    }

    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "User not authorized to modify this task" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // SECURITY: Allow if User is the Creator OR User is in the 'assignedTo' list OR Admin
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isCreator && !isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const { status } = req.body;
    if (status) {
      task.status = status;
    }

    // Smart Logic: If Completed, mark checklist items as done
    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task checklist
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update checklist" });
    }

    // Update checklist items with author tracking
    // We iterate through the new list and compare/assign
    task.todoChecklist = todoChecklist.map((newItem) => {
      const existingItem = task.todoChecklist.find(i => i._id && newItem._id && i._id.toString() === newItem._id.toString());

      // If status changed to completed, set completedBy
      if (newItem.completed && (!existingItem || !existingItem.completed)) {
        newItem.completedBy = req.user._id;
      } else if (newItem.completed && existingItem && existingItem.completed) {
        // Keep existing author
        newItem.completedBy = existingItem.completedBy;
      } else {
        // Not completed
        newItem.completedBy = null;
      }
      return newItem;
    });

    // Auto-update progress based on checklist completion
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Smart Status Logic
    if (task.progress === 100) {
      task.status = "In Review"; // Changed from "Completed"
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    ).populate("todoChecklist.completedBy", "name profileImageUrl"); // Populate who finished items

    res.json({ message: "Task checklist updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard Data (Admin only)
// @route   GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    // 1. DEFINE THE FILTER for the logged-in admin
    const createdByFilter = { createdBy: req.user._id };

    // 2. APPLY THE FILTER to all statistics queries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalTasks = await Task.countDocuments(createdByFilter);
    const pendingTasks = await Task.countDocuments({ ...createdByFilter, status: "Pending" });
    const completedTasks = await Task.countDocuments({ ...createdByFilter, status: "Completed" });
    const overdueTasks = await Task.countDocuments({
      ...createdByFilter, // <-- Add filter
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });
    const highPriorityTasks = await Task.countDocuments({
      ...createdByFilter,
      status: { $ne: "Completed" },
      priority: "High"
    });
    const completedTodayTasks = await Task.countDocuments({
      ...createdByFilter,
      status: "Completed",
      updatedAt: { $gte: startOfToday }
    });

    // 3. APPLY THE FILTER to the aggregation queries using '$match'
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: createdByFilter }, // <-- Add filter here
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    // Note: 'totalTasks' is already filtered, so this is now correct
    taskDistribution["All"] = totalTasks;

    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: createdByFilter }, // <-- Add filter here
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // 4. APPLY THE FILTER to the recent tasks query
    const recentTasks = await Task.find(createdByFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    // The rest of your response is correct
    res.status(200).json({
      statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks, highPriorityTasks, completedTodayTasks },
      charts: { taskDistribution, taskPriorityLevels },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard Data (User-specific)
// @route   GET /api/tasks/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // Only fetch data for the logged-in user

    // Fetch statistics for user-specific tasks
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    // Task distribution by status
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["ALL"] = totalTasks;

    // Task distribution by priority
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // Fetch recent 10 tasks for the logged-in user
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get master task and its child tasks
// @route   GET /api/tasks/master/:id
// @access  Private (Admin)
const getMasterTaskDetails = async (req, res) => {
  try {
    const masterTask = await Task.findById(req.params.id);

    if (!masterTask || masterTask.parentTask !== null) {
      return res.status(404).json({ message: "Master task not found" });
    }

    const childTasks = await Task.find({ parentTask: req.params.id }).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.json({ masterTask, childTasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const deleteMasterTask = async (req, res) => {
  try {
    const { id } = req.params;
    // First, delete all child tasks linked to this master task
    await Task.deleteMany({ parentTask: id });
    // Then, delete the master task itself
    await Task.findByIdAndDelete(id);
    res.json({ message: "Master task and sub-tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Schedule a task on Google Calendar
// @route   POST /api/tasks/:id/schedule
// @access  Private
const scheduleTaskOnCalendar = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const userId = req.user.id;

    // 1. Find the task and the user
    const task = await Task.findById(taskId);
    const user = await User.findById(userId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 2. Set up the Google OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // 3. Check if the user has authorized Google Calendar before
    if (!user.googleRefreshToken) {
      // If not, generate an authorization URL for the user to grant permission
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline", // 'offline' is required to get a refresh token
        scope: ["https://www.googleapis.com/auth/calendar"],
        // We can pass the taskId in the state to remember which task to schedule after auth
        state: JSON.stringify({ taskId }),
      });
      // Send a special response that tells the frontend to redirect
      return res.status(401).json({
        message: "Google Calendar authorization required.",
        authUrl: authUrl,
      });
    }

    // 4. If the user is already authorized, create the calendar event
    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // The event will be a 1-hour block on the task's due date
    const eventStartTime = new Date(task.dueDate);
    const eventEndTime = new Date(eventStartTime.getTime() + 60 * 60 * 1000); // 1 hour later

    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: eventStartTime.toISOString(),
        timeZone: "Asia/Kolkata", // Or your user's timezone
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    await calendar.events.insert({
      calendarId: "primary", // Use the user's primary calendar
      resource: event,
    });

    res.status(200).json({ message: "Task successfully scheduled on your Google Calendar!" });

  } catch (error) {
    console.error("Error scheduling on Google Calendar:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Review a task (Admin: Approve or Reject)
// @route   PUT /api/tasks/:id/review
// @access  Private (Admin)
const reviewTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const adminId = req.user._id;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (action === "APPROVE") {
      task.status = "Completed";
      // Ensure progress is 100
      task.progress = 100;
      task.todoChecklist.forEach(item => {
        if (!item.completed) {
          item.completed = true;
          item.completedBy = adminId; // Auto-complete by Admin? Or keep null? Admin effectively completed it.
        }
      });
    } else if (action === "REJECT") {
      task.status = "In Progress";
      // Ideally, we might want to uncheck specific items, but for now, we just push it back.
      // Or we can rely on progress. If progress was 100, we simply change status.
      // User requested: "Optionally accept a comment" -> We can log it or store it if we had a field.
      // For now, simple status revert.
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await task.save();
    res.json({ message: `Task ${action === "APPROVE" ? "Approved" : "Rejected"}`, task });

  } catch (error) {
    console.error("Error reviewing task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get tasks assigned to the current user within their organization
// @route   GET /api/tasks/my-tasks
// @access  Private (User)
const getMyOrganizationTasks = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserOrg = req.headers['x-org-id'];

    if (!currentUserOrg) {
      return res.status(400).json({ message: "Organization context missing" });
    }

    // New logic with organizationId and assignedTo indexes
    const tasks = await Task.find({
      organizationId: currentUserOrg,
      assignedTo: { $in: [currentUserId] }
    })
      .populate('assignedTo', 'name email profileImageUrl')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Calculate summary statistics for the frontend tabs
    const allTasksCount = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === "Pending").length;
    const inProgressTasks = tasks.filter(t => t.status === "In Progress" || t.status === "In Review").length; // Group active
    const completedTasks = tasks.filter(t => t.status === "Completed").length;

    res.json({
      tasks,
      statusSummary: {
        all: allTasksCount,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      }
    });

  } catch (error) {
    console.error("Error in getMyOrganizationTasks:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all organization tasks (Admin Only)
// @route   GET /api/tasks/organization
// @access  Private (Admin)
const getAllOrganizationTasks = async (req, res) => {
  try {
    const orgId = req.headers['x-org-id']; // Or req.user.organizationId, consistent with others

    // Fetch ALL tasks belonging to this Org
    const tasks = await Task.find({ organizationId: orgId })
      .populate('assignedTo', 'name email') // Show us WHO is working on it
      .populate('createdBy', 'name')        // Show us WHO created it
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
  getMasterTaskDetails,
  deleteMasterTask,
  scheduleTaskOnCalendar,
  reviewTask,
  getMyOrganizationTasks,
  getAllOrganizationTasks,
};
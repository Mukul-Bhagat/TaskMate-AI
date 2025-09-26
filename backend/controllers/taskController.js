const Task = require("../models/Task");
const User = require("../models/User");
const { google } = require("googleapis");

// @desc    Get all tasks (Admin: all, User: only assigned tasks)
// @route   GET /api/tasks/
// @access  Private
// In your backend's taskController.js

const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let statusFilter = {};

    // Only apply a status filter if it's not "All"
    if (status && status !== "All") {
      statusFilter.status = status;
    }

    // --- UPDATED LOGIC ---

    // 1. Define a base filter for the user's role
    let baseUserFilter =
      req.user.role === "admin"
        ? { createdBy: req.user._id }
        : { assignedTo: req.user._id };

    // 2. If the user is an admin, add the parentTask filter
    // This ensures they only see master/group tasks
    if (req.user.role === "admin") {
      baseUserFilter.parentTask = null;
    }

    // 3. The rest of the function now works with the correct filters
    const finalFilterForList = { ...baseUserFilter, ...statusFilter };

    let tasks = await Task.find(finalFilterForList).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

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
    );

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
    const {
      title, description, priority, dueDate, assignedTo,
      attachments, todoChecklist, assignmentType,
    } = req.body;

    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      return res.status(400).json({ message: "Task must be assigned to at least one user." });
    }

    if (assignmentType === "individual") {
      // 1. Create the main "master" task (not assigned to anyone)
      const masterTask = await Task.create({
        title, description, priority, dueDate, attachments, todoChecklist,
        assignmentType: "individual",
        createdBy: req.user._id,
        assignedTo: [], // Master task is a template, not assigned
      });

      // 2. Create a separate "child" task for each assigned user
      const childTasks = await Promise.all(
        assignedTo.map(async (userId) => {
          return Task.create({
            title, description, priority, dueDate, attachments, todoChecklist,
            assignedTo: [userId], // Assign to only this one user
            createdBy: req.user._id,
            parentTask: masterTask._id, // Link back to the master task
          });
        })
      );
      res.status(201).json({ message: `${childTasks.length} individual tasks created successfully` });
    } else {
      // This is the original "group" logic
      const groupTask = await Task.create({
        title, description, priority, dueDate, attachments, todoChecklist,
        assignedTo,
        createdBy: req.user._id,
        assignmentType: "group",
      });
      res.status(201).json({ message: "Group task created successfully", task: groupTask });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
const updateTaskStatus = async (req, res) => {
    try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.status = req.body.status || task.status;

    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();
    res.json({ message: "Task status updated", task });
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

    task.todoChecklist = todoChecklist; // Replace with updated checklist

    // Auto-update progress based on checklist completion
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Auto-mark task as completed if all items are checked
    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

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
    const totalTasks = await Task.countDocuments(createdByFilter);
    const pendingTasks = await Task.countDocuments({ ...createdByFilter, status: "Pending" });
    const completedTasks = await Task.countDocuments({ ...createdByFilter, status: "Completed" });
    const overdueTasks = await Task.countDocuments({
      ...createdByFilter, // <-- Add filter
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
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
      statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks },
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
};
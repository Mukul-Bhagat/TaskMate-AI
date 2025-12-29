const Task = require('../models/Task');

// GET /api/tasks/my-tasks
exports.getMyOrganizationTasks = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        // We get the Organization ID from the header, ensuring context
        const currentUserOrg = req.headers['x-org-id'];

        if (!currentUserOrg) {
            return res.status(400).json({ msg: "Organization context missing" });
        }

        // THE CORE LOGIC:
        // Find tasks that MATCH the user's Organization AND contain the user's ID in 'assignedTo'
        // This runs efficiently due to the new database indexes
        const tasks = await Task.find({
            organizationId: currentUserOrg,
            assignedTo: { $in: [currentUserId] }
        })
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(tasks);

    } catch (err) {
        console.error("Error in getMyOrganizationTasks:", err.message);
        res.status(500).send('Server Error');
    }
};

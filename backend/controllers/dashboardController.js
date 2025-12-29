const Task = require('../models/Task');
const User = require('../models/User');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const orgId = req.user.organizationId;

        if (!orgId) {
            return res.status(400).json({ msg: "Organization context missing" });
        }

        // Run all queries in parallel for speed
        const [totalTasks, pendingTasks, inProgressTasks, completedTasks, totalMembers] = await Promise.all([
            // 1. Total Tasks in Org
            Task.countDocuments({ organizationId: orgId }),

            // 2. Pending
            Task.countDocuments({ organizationId: orgId, status: 'Pending' }),

            // 3. In Progress
            Task.countDocuments({ organizationId: orgId, status: 'In Progress' }),

            // 4. Completed
            Task.countDocuments({ organizationId: orgId, status: 'Completed' }),

            // 5. Total Employees
            User.countDocuments({ organizationId: orgId })
        ]);

        // Return the summary object
        res.json({
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            totalMembers
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

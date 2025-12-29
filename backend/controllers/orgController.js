const Organization = require("../models/Organization");
const User = require("../models/User");

// @desc    Create a new organization
// @route   POST /api/orgs
// @access  Private
const createOrg = async (req, res) => {
    try {
        const { name } = req.body;

        // Create the organization
        const org = new Organization({
            name,
            owner: req.user.id,
        });
        const savedOrg = await org.save();

        // Add the creator as an Admin to the organization's memberships in their User profile
        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                memberships: {
                    organizationId: savedOrg._id,
                    role: "admin",
                },
            },
        });

        res.status(201).json(savedOrg);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get Invite Link
// @route   GET /api/orgs/:orgId/invite-link
// @access  Private (Admin only)
const getInviteLink = async (req, res) => {
    try {
        const { orgId } = req.params;
        const org = await Organization.findById(orgId);

        if (!org) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Check if user is an admin of this org (this logic might also be in middleware)
        const isMember = req.user.memberships.find(
            (m) => m.organizationId.toString() === orgId && m.role === 'admin'
        );

        if (!isMember) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const inviteLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/join/${org.inviteSlug}`;
        res.json({ inviteLink, inviteSlug: org.inviteSlug });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Request to join an organization via Invite Link
// @route   POST /api/orgs/join/:inviteSlug
// @access  Private
const requestToJoin = async (req, res) => {
    try {
        const { inviteSlug } = req.params;
        const org = await Organization.findOne({ inviteSlug });

        if (!org) {
            return res.status(404).json({ message: "Invalid Invite Link" });
        }

        // Check if already a member
        const existingMember = req.user.memberships.find(
            (m) => m.organizationId.toString() === org._id.toString()
        );

        if (existingMember) {
            return res.status(400).json({ message: "You are already a member of this organization" });
        }

        // Check if already requested
        const existingRequest = org.joinRequests.find(
            (req) => req.userId.toString() === req.user.id
        );

        if (existingRequest) {
            return res.status(400).json({ message: "Join request already sent" });
        }

        // Add to joinRequests
        org.joinRequests.push({ userId: req.user.id });
        await org.save();

        res.status(200).json({ message: "Join request sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Approve a join request
// @route   POST /api/orgs/:orgId/approve
// @access  Private (Admin only)
const approveRequest = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { userIdToApprove } = req.body;

        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ message: "Organization not found" });

        // Verify Admin Access
        const isAdmin = req.user.memberships.find(
            (m) => m.organizationId.toString() === orgId && m.role === 'admin'
        );
        if (!isAdmin) return res.status(403).json({ message: "Admins only" });

        // Check if request exists
        const requestIndex = org.joinRequests.findIndex(
            (r) => r.userId.toString() === userIdToApprove
        );

        if (requestIndex === -1) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Remove from requests
        org.joinRequests.splice(requestIndex, 1);

        // Add to Organization members list (optional, but good for tracking)
        org.members.push(userIdToApprove);
        await org.save();

        // Add to User's memberships
        await User.findByIdAndUpdate(userIdToApprove, {
            $push: {
                memberships: {
                    organizationId: org._id,
                    role: "member",
                },
            },
        });

        res.json({ message: "User approved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Switch Organization (Verify Access)
// @route   POST /api/orgs/switch/:orgId
// @access  Private
const switchOrg = async (req, res) => {
    try {
        const { orgId } = req.params;

        // This is mainly a verification step for the frontend to call before switching context
        const membership = req.user.memberships.find(
            (m) => m.organizationId.toString() === orgId
        );

        if (!membership) {
            return res.status(403).json({ message: "You are not a member of this organization" });
        }

        const org = await Organization.findById(orgId);

        res.json({
            message: "Context switched",
            org: {
                id: org._id,
                name: org.name,
                role: membership.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

// @desc    Get all members of an organization
// @route   GET /api/orgs/:orgId/members
// @access  Private
const getOrgMembers = async (req, res) => {
    try {
        const { orgId } = req.params;

        // Verify access (handled by middleware usually, but good to be safe)
        const membership = req.user.memberships.find(
            (m) => m.organizationId.toString() === orgId
        );

        if (!membership) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Find users who have a membership in this org
        // We look for users where 'memberships.organizationId' matches orgId
        const users = await User.find({
            "memberships.organizationId": orgId
        }).select("_id name email profileImageUrl");

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    createOrg,
    getInviteLink,
    requestToJoin,
    approveRequest,
    switchOrg,
    getOrgMembers
};

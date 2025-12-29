const express = require('express');
const router = express.Router();
// Correct named imports based on your authMiddleware.js structure
const { protect: authMiddleware, requireOrgAccess, adminOnly } = require('../middlewares/authMiddleware');
const {
    createOrg,
    getInviteLink,
    requestToJoin,
    approveRequest,
    switchOrg,
    getOrgMembers,
    getOrgDetails,
    updateOrganization
} = require('../controllers/orgController');

// 1. Public/Open Routes (Authenticated but no specific Org context needed yet)
router.post('/', authMiddleware, createOrg);
router.post('/create', authMiddleware, createOrg); // Keep legacy /create just in case
// NOTE: requestToJoin takes slug as a param based on controller definition
router.post('/join/:inviteSlug', authMiddleware, requestToJoin);

// 2. Protected Routes (Require specific Org ID in header)
// Note: 'adminOnly' middleware has been updated to be context-aware so it works after 'requireOrgAccess'
router.get('/:orgId/invite-link', authMiddleware, requireOrgAccess, adminOnly, getInviteLink);
router.post('/:orgId/approve', authMiddleware, requireOrgAccess, adminOnly, approveRequest);
router.get('/switch/:orgId', authMiddleware, switchOrg);
router.get('/:orgId/members', authMiddleware, requireOrgAccess, getOrgMembers);
router.get('/my-org', authMiddleware, getOrgDetails);
router.put('/my-org', authMiddleware, updateOrganization);

module.exports = router;

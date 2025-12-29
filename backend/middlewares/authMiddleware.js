const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in the authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID and attach to the request object
      // Exclude the password from the user object
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Proceed to the next middleware or route handler
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};

// Middleware for Admin-only access (Global or Context aware)
const adminOnly = (req, res, next) => {
  // Check global admin role if it exists (legacy) or specific org admin
  if (req.user && (req.user.role === "admin" || req.user.isAdmin)) {
    next();
  }
  // Context-aware admin check (if x-org-id provided)
  else if (req.headers['x-org-id']) {
    const orgId = req.headers['x-org-id'];
    const isAdmin = req.user.memberships?.find(
      (m) => m.organizationId.toString() === orgId && m.role === 'admin'
    );
    if (isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Access denied, admin only for this organization" });
    }
  }
  else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

// Middleware to check if user belongs to the organization specified in headers
const requireOrgAccess = (req, res, next) => {
  const orgId = req.headers['x-org-id'];

  if (!orgId) {
    return res.status(400).json({ message: "Organization ID missing in headers (x-org-id)" });
  }

  const hasAccess = req.user.memberships.find(
    (m) => m.organizationId.toString() === orgId
  );

  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied: You are not a member of this organization" });
  }

  // Attach current org role to request for easier access in controllers
  req.orgRole = hasAccess.role;
  next();
};

module.exports = { protect, adminOnly, requireOrgAccess };
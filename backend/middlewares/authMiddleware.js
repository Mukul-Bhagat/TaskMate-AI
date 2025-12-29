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

// Middleware for Admin-only access
const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  // 1. Check Global Admin (Legacy support)
  if (req.user.role === "admin" || req.user.isAdmin) {
    return next();
  }

  // 2. Check Context-Specific Admin (if x-org-id provided)
  const contextOrgId = req.headers['x-org-id'];
  if (contextOrgId) {
    const isContextAdmin = req.user.memberships?.some(
      (m) => m.organizationId.toString() === contextOrgId && m.role === 'admin'
    );
    if (isContextAdmin) {
      return next();
    }
  }

  // 3. Fallback: Check if they are an admin of ANY active organization
  // This allows them to access generic admin routes, and controllers can default to their first admin org.
  const isAnyAdmin = req.user.memberships?.some(m => m.role === 'admin');
  if (isAnyAdmin) {
    return next();
  }

  return res.status(403).json({ message: "Access denied, admin privilege required." });
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
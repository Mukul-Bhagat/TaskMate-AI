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
  // The 'protect' middleware must run first to populate req.user
  if (req.user && req.user.role === "admin") {
    next(); // User is an admin, proceed
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

module.exports = { protect, adminOnly };
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const passport = require('passport');

// Import all route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const googleApiRoutes = require("./routes/googleApiRoutes");

const app = express();

app.set('trust proxy', 1);

// Passport Config
require('./config/passport')(passport);

// Middleware to handle CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-org-id"],
    credentials: true,
  })
);

// Make the 'uploads' folder public
app.use('/uploads', express.static('uploads'));

// Connect Database
connectDB();

// Core Middleware
app.use(express.json());

// === ADD THIS LINE ===
// Passport Middleware Initialization
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Keep only one
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/google", googleApiRoutes);
app.use("/api/orgs", require("./routes/orgRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Start Server
const PORT = process.env.PORT || 8000; // I see PORT=8000 in your .env, so the server will run there
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Fixed typo "Surver"

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

// Passport Config
require('./config/passport')(passport);

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    method: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

// Start Server
const PORT = process.env.PORT || 8000; // I see PORT=8000 in your .env, so the server will run there
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Fixed typo "Surver"
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes= require("./routes/authRoutes")
const userRoutes= require("./routes/userRoutes")
const taskRoutes= require("./routes/taskRoutes")
const reportRoutes= require("./routes/reportRoutes")

const app = express();

//Middleware to handle CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        method: ["GET","POST","PUT","DELETE"],
        allowedHeaders: ["Content-Type","Authorization"],
    })
);

// Make the 'uploads' folder public
app.use('/uploads', express.static('uploads'));

//Connect Database
connectDB();

//Middleware
app.use(express.json());

//Routes
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/reports",reportRoutes);
app.use("/api/users", require("./routes/userRoutes"));

//Server Upload folder
app.use("/upload",express.static(path.join(__dirname,"upload")));

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Surver running on port ${PORT}`));

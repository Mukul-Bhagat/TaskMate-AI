const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
});


const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
        status: { type: String, enum: ["Pending", "In Progress", "In Review", "Completed"], default: "Pending" },
        dueDate: { type: Date, required: true },
        assignmentType: {
            type: String,
            enum: ["group", "individual", "me"],
            default: "group",
        },
        parentTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            default: null,
        },
        assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
        attachments: [{
            type: { type: String, enum: ['file', 'link'], required: true },
            url: { type: String, required: true },
            name: { type: String }
        }],
        todoChecklist: [todoSchema],
        progress: { type: Number, default: 0 }

    },
    { timestamps: true }
);
module.exports = mongoose.model("Task", taskSchema);
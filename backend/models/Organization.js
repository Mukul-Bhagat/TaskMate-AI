const mongoose = require("mongoose");
const crypto = require("crypto");

const OrganizationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        inviteSlug: { type: String, unique: true },
        joinRequests: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                requestedAt: { type: Date, default: Date.now },
            },
        ],
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Optional: redundant with User.memberships but good for quick lookups
    },
    { timestamps: true }
);

// Generate a random slug before saving if not present
OrganizationSchema.pre('save', function (next) {
    if (!this.inviteSlug) {
        this.inviteSlug = crypto.randomBytes(8).toString('hex');
    }
    next();
});

module.exports = mongoose.model("Organization", OrganizationSchema);

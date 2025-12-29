const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      // Make password required only if the user does not have a googleId
      required: function () { return !this.googleId; },
    },
    googleId: { type: String },
    profileImageUrl: { type: String, default: null },
    // memberships replaces the single 'role'
    memberships: [
      {
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
        role: { type: String, enum: ["admin", "member"], default: "member" },
      },
    ],

    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiry: { type: Date },

    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);


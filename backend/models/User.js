const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    name: {type: String, required: true},
    email: {type: String, required: true, unique:true},
    password: {
      type: String,
      // Make password required only if the user does not have a googleId
      required: function() { return !this.googleId; },
    },
    googleId: { type: String },
    profileImageUrl: {type: String, default: null},
    role: {type: String, enum: ["admin","member"], default:"member"},//Role-based access

    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiry: { type: Date },
},
    {timestamps: true}
);
module.exports = mongoose.model("User",UserSchema);


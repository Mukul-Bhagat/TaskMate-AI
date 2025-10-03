const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    name: {type: String, required: true},
    email: {type: String, required: true, unique:true},
    password: {
        type: String,
        required: function() { return !this.googleId; }, // This line is the fix
        },
    profileImageUrl: {type: String, default: null},
    role: {type: String, enum: ["admin","member"], default:"member"},//Role-based access

    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiry: { type: Date },
},
    {timestamps: true}
);
module.exports = mongoose.model("User",UserSchema);


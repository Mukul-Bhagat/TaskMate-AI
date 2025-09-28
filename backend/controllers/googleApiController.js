const { google } = require("googleapis");
const User = require("../models/User");

// @desc    Redirects user to Google for calendar authorization
const googleAuth = (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID, // Use specific keys
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Pass the logged-in user's ID in the 'state' parameter
  const state = JSON.stringify({ userId: req.user.id });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // Important to get a refresh token every time
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: state,
  });

  res.redirect(authUrl);
};

// @desc    Handles the callback from Google OAuth
const googleAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.status(400).send("Error: Google authentication failed.");
  }

  try {
    const { userId } = JSON.parse(state || "{}");
    if (!userId) {
      return res.status(400).send("Error: User identification failed.");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;

    // Find the correct user by their ID and save the tokens
    await User.findByIdAndUpdate(userId, {
      googleAccessToken: access_token,
      googleRefreshToken: refresh_token,
      googleTokenExpiry: new Date(expiry_date),
    });

    // Redirect the user back to their dashboard
    res.redirect(`http://localhost:5173/user/dashboard`);

  } catch (error) {
    console.error("Error during Google callback:", error);
    res.status(500).send("Error: Could not process Google callback.");
  }
};

module.exports = {
  googleAuth,
  googleAuthCallback,
};
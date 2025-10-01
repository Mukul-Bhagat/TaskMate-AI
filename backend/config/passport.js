// backend/config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy({
    clientID: process.env.GOOGLE_SIGNIN_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SIGNIN_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImageUrl: profile.photos[0].value,
          role: 'member', // Default role for all Google sign-ups
        };

        try {
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // User exists, log them in
            done(null, user);
          } else {
            // User doesn't exist, create them
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );
};

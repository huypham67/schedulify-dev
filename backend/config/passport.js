const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/user.model');
const env = require('./environment');

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google Strategy - Only configure if credentials are available
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            $or: [
              { oauthId: profile.id, authType: 'google' },
              { email: profile.emails[0].value }
            ]
          });

          if (user) {
            // If user exists but with different auth type, update OAuth info
            if (user.authType !== 'google') {
              user.oauthId = profile.id;
              user.authType = 'google';
              user.isVerified = true;
              await user.save();
            }
          } else {
            // Create new user
            user = new User({
              email: profile.emails[0].value,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              profileImage: profile.photos[0].value,
              oauthId: profile.id,
              authType: 'google',
              isVerified: true
            });
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('Google OAuth disabled: Missing client credentials');
}

// Facebook Strategy - Only configure if credentials are available
if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: env.FACEBOOK_APP_ID,
        clientSecret: env.FACEBOOK_APP_SECRET,
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'picture.type(large)']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Similar implementation as Google strategy
          let user = await User.findOne({
            $or: [
              { oauthId: profile.id, authType: 'facebook' },
              { email: profile.emails[0].value }
            ]
          });

          if (user) {
            // If user exists but with different auth type, update OAuth info
            if (user.authType !== 'facebook') {
              user.oauthId = profile.id;
              user.authType = 'facebook';
              user.isVerified = true;
              await user.save();
            }
          } else {
            // Create new user
            user = new User({
              email: profile.emails[0].value,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              profileImage: profile.photos[0].value,
              oauthId: profile.id,
              authType: 'facebook',
              isVerified: true
            });
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('Facebook OAuth disabled: Missing client credentials');
}

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

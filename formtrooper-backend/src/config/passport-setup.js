const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called after Google authenticates the user
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const name = profile.displayName;

      try {
        // Find a user with the matching email. If they exist, update their googleId.
        // If they don't exist, create a new user.
        const user = await prisma.user.upsert({
          where: { email: email },
          update: { googleId: googleId },
          create: {
            email: email,
            name: name,
            googleId: googleId,
          },
        });
        
        // Pass the user object to the next step in the auth flow
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
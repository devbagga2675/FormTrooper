const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Route #1: The user clicks "Login with Google" on the frontend.
// This route starts the authentication process.
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'], // We ask Google for the user's profile and email
    session: false,
  })
);

// Route #2: The route Google redirects back to after the user approves.
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:3000/login?error=true', // Redirect on failure
  }),
  (req, res) => {
    // If authentication is successful, passport attaches the user object to req.user.
    const user = req.user;

    // We create a JWT for our application.
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // We redirect the user back to the frontend, passing the token in the URL.
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  }
);

module.exports = router;
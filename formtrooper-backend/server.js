require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const authRoutes = require('./src/routes/auth.routes');
const formRoutes = require('./src/routes/form.routes');
const documentRoutes = require('./src/routes/document.routes');
const aiRoutes = require('./src/routes/ai.routes');
const analysisRoutes = require('./src/routes/analysis.routes');
const { errorHandler } = require('./src/middlewares/error.middlewares'); // <-- Import
require('./src/config/passport-setup');

const app = express();
const PORT = process.env.PORT || 8080;

// Check for required environment variables at startup
const requiredEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'SESSION_SECRET', 'JWT_SECRET'];
for (const envVar of requiredEnv) {
    if (!process.env[envVar]) {
        throw new Error(`FATAL ERROR: Environment variable ${envVar} is not defined.`);
    }
}

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analysis', analysisRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Backend server is up and running!' });
});

// Final Error Handling Middleware
app.use(errorHandler); // <-- Add this at the end

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
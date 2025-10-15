const express = require('express');
const router = express.Router();
const { analyzeResponsesController } = require('../controllers/analysis.controller');
const { protectRoute } = require('../middlewares/auth.middlewares');

// A protected route to trigger the analysis for a specific form
router.post('/:formId', protectRoute, analyzeResponsesController);

module.exports = router;
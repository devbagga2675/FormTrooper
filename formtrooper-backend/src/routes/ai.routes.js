const express = require("express");
const router = express.Router();
const { refineFormController } = require("../controllers/ai.controller");
const { protectRoute } = require("../middlewares/auth.middlewares");
const { queryFormController } = require('../controllers/ai.controller');
// A protected route to trigger the AI refinement process for a specific form
router.post("/refine/:formId", protectRoute, refineFormController);
router.post('/query/:formId', protectRoute, queryFormController);

module.exports = router;

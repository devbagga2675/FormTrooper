const express = require("express");
const router = express.Router();
const {
  generateFormController,
  getUserFormsController,
  deleteFormController,
  getFormByIdController,
  updateFormController,
  getFormResponsesController
} = require("../controllers/form.controller");
const { protectRoute } = require("../middlewares/auth.middlewares");
const { generateDummyResponsesController } = require('../controllers/form.controller');

// Apply the protectRoute middleware to this endpoint
router.post("/generate", protectRoute, generateFormController);
router.get("/", protectRoute, getUserFormsController);
router.delete("/:id", protectRoute, deleteFormController);
router.get("/:id", protectRoute, getFormByIdController);
router.put("/:id", protectRoute, updateFormController);
router.post('/:id/generate-dummy-responses', protectRoute, generateDummyResponsesController);
router.get('/:id/responses', protectRoute, getFormResponsesController);
module.exports = router;

const express = require('express');
const multer = require('multer');
const { uploadDocumentController } = require('../controllers/document.controller');
const { protectRoute } = require('../middlewares/auth.middlewares');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protectRoute, upload.single('file'), uploadDocumentController);

module.exports = router;
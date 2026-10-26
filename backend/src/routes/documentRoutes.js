const express = require('express');
const documentController = require('../controllers/documentController');
const requireUser = require('../middleware/requireUser');
const uploadMiddleware = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', requireUser, uploadMiddleware.single('file'), documentController.upload);
router.get('/documents', requireUser, documentController.list);
router.get('/documents/:id/download', requireUser, documentController.download);

module.exports = router;
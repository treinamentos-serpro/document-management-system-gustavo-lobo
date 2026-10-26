const crypto = require('node:crypto');
const multer = require('multer');
const { maxFileSizeBytes, storageDirectory } = require('../config');

const storage = multer.diskStorage({
  destination: storageDirectory,
  filename: (req, file, callback) => callback(null, crypto.randomUUID()),
});

module.exports = multer({
  storage,
  limits: { fileSize: maxFileSizeBytes, files: 1 },
});
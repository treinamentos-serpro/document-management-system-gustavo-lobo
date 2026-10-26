const fs = require('node:fs');
const path = require('node:path');

const backendDirectory = path.resolve(__dirname, '..');
const storageDirectory = path.resolve(
  backendDirectory,
  process.env.STORAGE_DIR || 'storage'
);
const maxFileSizeValue = process.env.MAX_FILE_SIZE_BYTES || '10485760';

if (!/^\d+$/.test(maxFileSizeValue) || Number(maxFileSizeValue) <= 0) {
  throw new Error('MAX_FILE_SIZE_BYTES deve ser um inteiro maior que zero.');
}

const maxFileSizeBytes = Number(maxFileSizeValue);
fs.mkdirSync(storageDirectory, { recursive: true });

module.exports = { storageDirectory, maxFileSizeBytes };
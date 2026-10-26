const fs = require('node:fs');
const path = require('node:path');
const { storageDirectory } = require('../config');

function getFilePath(storedName) {
  const filePath = path.resolve(storageDirectory, storedName);
  if (!filePath.startsWith(`${storageDirectory}${path.sep}`)) {
    throw new Error('Nome interno de arquivo inválido.');
  }
  return filePath;
}

async function exists(storedName) {
  try {
    await fs.promises.access(getFilePath(storedName), fs.constants.R_OK);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EACCES') return false;
    throw error;
  }
}

async function remove(storedName) {
  try {
    await fs.promises.unlink(getFilePath(storedName));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function createReadStream(storedName) {
  return fs.createReadStream(getFilePath(storedName));
}

module.exports = { createReadStream, exists, remove };
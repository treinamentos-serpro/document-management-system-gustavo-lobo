const crypto = require('node:crypto');
const metadataRepository = require('../repositories/documentMetadataRepository');
const fileStorageRepository = require('../repositories/fileStorageRepository');
const HttpError = require('../errors/HttpError');

function toPublicDocument({ storedName, ...document }) {
  return document;
}

function getOriginalName(originalName) {
  const name = originalName
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();
  return name || 'document';
}

async function createDocument(owner, file) {
  if (!file) {
    throw new HttpError(400, 'FILE_REQUIRED', 'Envie um arquivo no campo "file".');
  }

  if (file.size === 0) {
    await fileStorageRepository.remove(file.filename);
    throw new HttpError(400, 'EMPTY_FILE', 'O arquivo enviado está vazio.');
  }

  const document = {
    id: crypto.randomUUID(),
    originalName: getOriginalName(file.originalname),
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storedName: file.filename,
  };

  try {
    return toPublicDocument(metadataRepository.create(document));
  } catch (error) {
    await fileStorageRepository.remove(file.filename).catch(() => {});
    throw error;
  }
}

function listDocuments(owner) {
  return metadataRepository.listByOwner(owner).map(toPublicDocument);
}

async function getDocumentForDownload(id, owner) {
  const document = metadataRepository.findByIdAndOwner(id, owner);
  if (!document || !(await fileStorageRepository.exists(document.storedName))) {
    return null;
  }

  return {
    document: toPublicDocument(document),
    stream: fileStorageRepository.createReadStream(document.storedName),
  };
}

module.exports = { createDocument, getDocumentForDownload, listDocuments };
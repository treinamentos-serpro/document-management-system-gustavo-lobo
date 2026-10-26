const HttpError = require('../errors/HttpError');
const documentService = require('../services/documentService');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function upload(req, res) {
  const document = await documentService.createDocument(req.userId, req.file);
  return res.status(201).json(document);
}

function list(req, res) {
  return res.status(200).json(documentService.listDocuments(req.userId));
}

async function download(req, res, next) {
  if (!UUID_PATTERN.test(req.params.id)) {
    throw new HttpError(400, 'INVALID_DOCUMENT_ID', 'O identificador do documento é inválido.');
  }

  const result = await documentService.getDocumentForDownload(req.params.id, req.userId);
  if (!result) {
    throw new HttpError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
  }

  result.stream.on('error', (error) => {
    if (res.headersSent) return res.destroy(error);
    const status = error.code === 'ENOENT' ? 404 : 500;
    next(new HttpError(
      status,
      status === 404 ? 'DOCUMENT_NOT_FOUND' : 'FILE_READ_ERROR',
      status === 404 ? 'Documento não encontrado.' : 'Não foi possível ler o documento.'
    ));
  });

  res.type('application/octet-stream').attachment(result.document.originalName);
  result.stream.pipe(res);
}

module.exports = { download, list, upload };
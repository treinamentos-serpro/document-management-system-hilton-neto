const fs = require('node:fs/promises');
const documentsService = require('../services/documents.service');

function upload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      error: { code: 'FILE_REQUIRED', message: 'Envie um arquivo no campo "file".' },
    });
  }

  if (req.file.size === 0) {
    return fs.unlink(req.file.path)
      .then(
        () => res.status(400).json({
          error: { code: 'EMPTY_FILE', message: 'O arquivo enviado está vazio.' },
        }),
        next,
      );
  }

  try {
    const document = documentsService.createDocument(req.file);
    return res.status(201).json({ document });
  } catch (error) {
    return next(error);
  }
}

function list(req, res, next) {
  try {
    return res.status(200).json({ documents: documentsService.listDocuments() });
  } catch (error) {
    return next(error);
  }
}

function download(req, res, next) {
  try {
    const document = documentsService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({
        error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
      });
    }

    res.type(document.mimeType || 'application/octet-stream');
    return res.download(document.filePath, document.originalName, (error) => {
      if (!error || res.headersSent) return;
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
        });
      }
      return next(error);
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { upload, list, download };
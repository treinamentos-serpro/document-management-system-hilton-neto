const documentsRepository = require('../repositories/documents.repository');

function createDocument(file) {
  return documentsRepository.create({
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    storageName: file.filename,
    owner: process.env.DMS_DEFAULT_OWNER || 'local-user',
  });
}

function listDocuments() {
  return documentsRepository.list();
}

function getDocument(id) {
  return documentsRepository.findById(id);
}

module.exports = { createDocument, listDocuments, getDocument };
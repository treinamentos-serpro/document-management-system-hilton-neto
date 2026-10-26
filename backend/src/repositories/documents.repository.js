const crypto = require('node:crypto');
const path = require('node:path');

const storageDirectory = process.env.DMS_STORAGE_DIR
  ? path.resolve(process.env.DMS_STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');
const documents = new Map();

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

function create(documentData) {
  const document = {
    id: crypto.randomUUID(),
    originalName: documentData.originalName,
    size: documentData.size,
    uploadedAt: new Date().toISOString(),
    owner: documentData.owner,
    mimeType: documentData.mimeType,
    storageName: documentData.storageName,
  };

  documents.set(document.id, document);
  return toPublicDocument(document);
}

function list() {
  return [...documents.values()]
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt))
    .map(toPublicDocument);
}

function findById(id) {
  const document = documents.get(id);
  if (!document) return null;

  return {
    ...toPublicDocument(document),
    filePath: path.join(storageDirectory, document.storageName),
  };
}

module.exports = { create, list, findById };
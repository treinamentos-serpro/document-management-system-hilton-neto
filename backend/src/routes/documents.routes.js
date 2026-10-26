const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
const storageDirectory = process.env.DMS_STORAGE_DIR
  ? path.resolve(process.env.DMS_STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');
const configuredLimit = Number(process.env.MAX_UPLOAD_SIZE_BYTES);
const maxFileSize = Number.isSafeInteger(configuredLimit) && configuredLimit > 0
  ? configuredLimit
  : 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => {
      callback(error, storageDirectory);
    });
  },
  filename: (req, file, callback) => {
    callback(null, crypto.randomUUID());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize, files: 1 },
});

router.post('/upload', upload.single('file'), documentsController.upload);
router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

module.exports = router;
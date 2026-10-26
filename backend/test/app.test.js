const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.DMS_STORAGE_DIR = storageDirectory;
process.env.MAX_UPLOAD_SIZE_BYTES = '1024';
const app = require('../src/app');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload, listagem e download de documentos', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const missingFileResponse = await fetch(`${baseUrl}/upload`, { method: 'POST' });
    assert.strictEqual(missingFileResponse.status, 400);

    const oversizedForm = new FormData();
    oversizedForm.append('file', new Blob(['x'.repeat(1025)]), 'large.txt');
    const oversizedResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: oversizedForm,
    });
    assert.strictEqual(oversizedResponse.status, 413);

    const emptyForm = new FormData();
    emptyForm.append('file', new Blob([]), 'empty.txt');
    const emptyResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: emptyForm,
    });
    assert.strictEqual(emptyResponse.status, 400);

    const form = new FormData();
    form.append('file', new Blob(['conteudo do documento']), 'documento.txt');
    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: form,
    });
    assert.strictEqual(uploadResponse.status, 201);
    const { document } = await uploadResponse.json();
    assert.strictEqual(document.originalName, 'documento.txt');
    assert.strictEqual(document.size, Buffer.byteLength('conteudo do documento'));
    assert.strictEqual(document.owner, 'local-user');
    assert.ok(!Object.hasOwn(document, 'storageName'));
    assert.strictEqual(fs.readdirSync(storageDirectory).length, 1);

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);
    assert.deepStrictEqual((await listResponse.json()).documents, [document]);

    const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
    assert.strictEqual(downloadResponse.status, 200);
    assert.match(downloadResponse.headers.get('content-disposition'), /attachment/);
    assert.strictEqual(await downloadResponse.text(), 'conteudo do documento');

    const notFoundResponse = await fetch(`${baseUrl}/documents/unknown/download`);
    assert.strictEqual(notFoundResponse.status, 404);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    fs.rmSync(storageDirectory, { recursive: true, force: true });
  }
});

const API_BASE = '/api';

async function readResponse(response) {
  if (response.ok) return response;

  let message = 'Não foi possível concluir a solicitação.';
  try {
    const payload = await response.json();
    message = payload.error?.message || message;
  } catch {
    // Mantém a mensagem padrão quando a resposta não contém JSON.
  }

  throw new Error(message);
}

export async function getDocuments() {
  const response = await readResponse(await fetch(`${API_BASE}/documents`));
  const payload = await response.json();
  return payload.documents;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await readResponse(await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  }));
  const payload = await response.json();
  return payload.document;
}

export async function downloadDocument(id) {
  const response = await readResponse(await fetch(
    `${API_BASE}/documents/${encodeURIComponent(id)}/download`,
  ));
  return response.blob();
}
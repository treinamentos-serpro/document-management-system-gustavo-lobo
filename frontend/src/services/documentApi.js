const API_BASE = '/api';

async function readError(response) {
  try {
    const body = await response.json();
    return body.error?.message || 'Não foi possível concluir a solicitação.';
  } catch {
    return 'Não foi possível concluir a solicitação.';
  }
}

async function requestJson(url, userId, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'X-User-Id': userId,
    },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json();
}

export function listDocuments(userId) {
  return requestJson('/documents', userId);
}

export function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  return requestJson('/upload', userId, {
    method: 'POST',
    body: formData,
  });
}

export async function downloadDocument(document, userId) {
  const response = await fetch(
    `${API_BASE}/documents/${encodeURIComponent(document.id)}/download`,
    { headers: { 'X-User-Id': userId } }
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = document.originalName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi.js';

export default function DownloadButton({ document, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const fileBlob = await downloadDocument(document.id);
      const objectUrl = window.URL.createObjectURL(fileBlob);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = document.originalName;
      link.click();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      onError(error.message || 'Não foi possível baixar o documento.');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      className="download-button"
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-label={`Baixar ${document.originalName}`}
      title={`Baixar ${document.originalName}`}
    >
      <span aria-hidden="true">↓</span>
      <span>{isDownloading ? 'Baixando' : 'Baixar'}</span>
    </button>
  );
}
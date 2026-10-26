import DownloadButton from './DownloadButton.jsx';

export default function DocumentList({ documents, isLoading, onDownloadError }) {
  if (isLoading) {
    return (
      <div className="list-state" role="status">
        <span className="loading-mark" aria-hidden="true" />
        <span>Carregando documentos...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">—</span>
        <h3>Nenhum documento ainda</h3>
        <p>Os arquivos enviados aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li className="document-row" key={document.id}>
          <span className="file-mark" aria-hidden="true">{getExtension(document.originalName)}</span>
          <div className="document-details">
            <span className="document-name" title={document.originalName}>{document.originalName}</span>
            <span className="document-meta">
              {formatBytes(document.size)} <span>·</span> <time dateTime={document.uploadedAt}>{formatDate(document.uploadedAt)}</time>
            </span>
          </div>
          <DownloadButton document={document} onError={onDownloadError} />
        </li>
      ))}
    </ul>
  );
}

function getExtension(fileName) {
  const extension = fileName.split('.').pop();
  return extension && extension !== fileName
    ? extension.slice(0, 5).toUpperCase()
    : 'DOC';
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
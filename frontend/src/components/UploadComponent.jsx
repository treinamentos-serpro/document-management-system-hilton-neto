import { useRef, useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  function selectFile(file) {
    setSelectedFile(file || null);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      // O formulário mantém o arquivo selecionado para permitir uma nova tentativa.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div
        className={`drop-zone ${isDragging ? 'drop-zone-active' : ''} ${selectedFile ? 'drop-zone-selected' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="file-input"
          id="document-file"
          type="file"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <label className="drop-zone-label" htmlFor="document-file">
          <span className="upload-symbol" aria-hidden="true">↥</span>
          <span className="drop-title">{selectedFile ? 'Arquivo selecionado' : 'Solte o arquivo aqui'}</span>
          <span className="drop-hint">ou <span className="browse-link">escolha no dispositivo</span></span>
        </label>
      </div>

      {selectedFile ? (
        <div className="selected-file" title={selectedFile.name}>
          <span className="selected-file-mark" aria-hidden="true">FILE</span>
          <span className="selected-file-name">{selectedFile.name}</span>
          <span className="selected-file-size">{formatBytes(selectedFile.size)}</span>
          <button
            className="remove-file"
            type="button"
            aria-label="Remover arquivo selecionado"
            onClick={() => {
              selectFile(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
      ) : (
        <p className="upload-hint">Um arquivo por envio <span>·</span> limite padrão de 10 MiB</p>
      )}

      <button className="primary-button" type="submit" disabled={!selectedFile || isSubmitting}>
        <span aria-hidden="true">{isSubmitting ? '…' : '↑'}</span>
        {isSubmitting ? 'Enviando arquivo' : 'Enviar documento'}
      </button>
    </form>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
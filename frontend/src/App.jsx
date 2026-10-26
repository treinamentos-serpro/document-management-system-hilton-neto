import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { getDocuments, uploadDocument } from './services/documentsApi.js';
import './styles.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isActive = true;

    getDocuments()
      .then((items) => {
        if (isActive) setDocuments(items);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function refreshDocuments() {
    setIsRefreshing(true);
    setError('');

    try {
      setDocuments(await getDocuments());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleUpload(file) {
    setError('');
    setNotice('');

    try {
      const uploadedDocument = await uploadDocument(file);
      setDocuments((currentDocuments) => [uploadedDocument, ...currentDocuments]);
      setNotice(`${file.name} foi enviado com sucesso.`);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>Arquivo<span className="brand-light"> / local</span></span>
        </a>
        <span className="storage-status"><span aria-hidden="true" /> Armazenamento local</span>
      </header>

      <main className="workspace" id="inicio">
        <div className="page-heading">
          <div>
            <p className="eyebrow">GESTÃO DE DOCUMENTOS <span> / </span> 01</p>
            <h1>Seus documentos,<br className="mobile-break" /> em ordem.</h1>
            <p className="page-description">Envie arquivos, consulte o acervo e baixe o que precisa.</p>
          </div>
          <div className="document-total" aria-live="polite">
            <span className="total-number">{documents.length.toString().padStart(2, '0')}</span>
            <span className="total-label">{documents.length === 1 ? 'documento' : 'documentos'}</span>
          </div>
        </div>

        {(error || notice) && (
          <div className={`feedback ${error ? 'feedback-error' : 'feedback-success'}`} role={error ? 'alert' : 'status'}>
            <span aria-hidden="true">{error ? '!' : '✓'}</span>
            <p>{error || notice}</p>
            <button
              className="feedback-dismiss"
              type="button"
              aria-label="Fechar mensagem"
              onClick={() => {
                setError('');
                setNotice('');
              }}
            >
              ×
            </button>
          </div>
        )}

        <div className="content-grid">
          <section className="upload-section" aria-labelledby="upload-heading">
            <div className="section-heading">
              <span className="section-index">01</span>
              <h2 id="upload-heading">Adicionar arquivo</h2>
            </div>
            <UploadComponent onUpload={handleUpload} />
            <p className="storage-note"><span aria-hidden="true">↳</span> Os arquivos são armazenados neste dispositivo.</p>
          </section>

          <section className="documents-section" aria-labelledby="documents-heading">
            <div className="section-heading list-heading">
              <div className="section-title-wrap">
                <span className="section-index">02</span>
                <h2 id="documents-heading">Acervo</h2>
              </div>
              <button
                className="refresh-button"
                type="button"
                onClick={refreshDocuments}
                disabled={isRefreshing}
                title="Atualizar lista"
                aria-label="Atualizar lista de documentos"
              >
                <span aria-hidden="true">↻</span>
              </button>
            </div>
            <DocumentList documents={documents} isLoading={isLoading || isRefreshing} onDownloadError={setError} />
          </section>
        </div>
        <footer className="page-footer">
          <span>DMS <span className="footer-divider">·</span> GESTÃO LOCAL</span>
          <span>Metadados disponíveis durante esta sessão</span>
        </footer>
      </main>
    </div>
  );
}

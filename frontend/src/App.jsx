import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/documentApi.js';
import './App.css';

export default function App() {
  const [userId, setUserId] = useState(
    () => window.localStorage.getItem('dms-user-id') || 'usuario-demo'
  );
  const [userDraft, setUserDraft] = useState(userId);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setLoadError('');

    listDocuments(userId)
      .then((items) => {
        if (isCurrent) setDocuments(items);
      })
      .catch((error) => {
        if (isCurrent) {
          setDocuments([]);
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [userId, reloadVersion]);

  function selectUser(event) {
    event.preventDefault();
    const nextUserId = userDraft.trim();
    if (!nextUserId) return;

    window.localStorage.setItem('dms-user-id', nextUserId);
    setUserDraft(nextUserId);
    setUserId(nextUserId);
  }

  function refreshDocuments() {
    setReloadVersion((version) => version + 1);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#inicio" aria-label="DMS, início">
          <span className="wordmark-mark" aria-hidden="true">D</span>
          <span>DMS <span className="wordmark-subtitle">ARQUIVO DIGITAL</span></span>
        </a>
        <form className="user-switcher" onSubmit={selectUser}>
          <label htmlFor="user-id">Usuário</label>
          <input
            id="user-id"
            value={userDraft}
            onChange={(event) => setUserDraft(event.target.value)}
            maxLength={100}
            aria-label="Identificador do usuário"
          />
          <button type="submit" disabled={!userDraft.trim()}>
            Aplicar
          </button>
        </form>
      </header>

      <main className="workspace" id="inicio">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">ESPAÇO PESSOAL</p>
            <h1 id="page-title">Seus documentos</h1>
            <p className="page-description">
              Arquivos enviados ficam disponíveis para consulta neste espaço.
            </p>
          </div>
          <div className="document-count" aria-live="polite">
            <span className="count-number">{documents.length.toString().padStart(2, '0')}</span>
            <span>documentos</span>
          </div>
        </section>

        <UploadComponent userId={userId} onUploadComplete={refreshDocuments} />

        <section className="documents-section" aria-labelledby="documents-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BIBLIOTECA</p>
              <h2 id="documents-title">Arquivos recentes</h2>
            </div>
            <button
              className="refresh-button"
              type="button"
              onClick={refreshDocuments}
              disabled={isLoading}
              title="Atualizar lista"
            >
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {loadError ? (
            <div className="list-message error-message" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={refreshDocuments}>Tentar novamente</button>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              userId={userId}
              isLoading={isLoading}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>Document Management System</span>
        <span>Armazenamento local</span>
      </footer>
    </div>
  );
}

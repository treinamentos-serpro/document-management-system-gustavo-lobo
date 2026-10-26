import DownloadButton from './DownloadButton.jsx';

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, userId, isLoading }) {
  if (isLoading && documents.length === 0) {
    return <p className="list-message" role="status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-index" aria-hidden="true">00</span>
        <div>
          <h3>Nenhum documento por aqui</h3>
          <p>Os arquivos enviados aparecerão nesta lista.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap" aria-busy={isLoading}>
      <table className="document-table">
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Tamanho</th>
            <th scope="col">Enviado em</th>
            <th scope="col"><span className="visually-hidden">Ação</span></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td className="document-name" title={document.originalName}>
                <span className="file-mark" aria-hidden="true">DOC</span>
                <span>{document.originalName}</span>
              </td>
              <td className="muted-cell">{formatSize(document.size)}</td>
              <td className="muted-cell">{formatDate(document.uploadedAt)}</td>
              <td className="action-cell">
                <DownloadButton document={document} userId={userId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
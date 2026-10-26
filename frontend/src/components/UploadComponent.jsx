import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadComponent({ userId, onUploadComplete }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function chooseFile(nextFile) {
    if (!nextFile) return;
    setFile(nextFile);
    setMessage('');
    setError('');
  }

  async function submitUpload(event) {
    event.preventDefault();
    if (!file || isUploading) return;
    if (file.size === 0) {
      setError('O arquivo selecionado está vazio.');
      return;
    }

    setIsUploading(true);
    setError('');
    setMessage('');
    try {
      await uploadDocument(file, userId);
      setMessage(`${file.name} enviado com sucesso.`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      onUploadComplete();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  }

  return (
    <section className="upload-panel" aria-labelledby="upload-title">
      <div className="upload-copy">
        <p className="eyebrow">ADICIONAR AO ARQUIVO</p>
        <h2 id="upload-title">Enviar documento</h2>
        <p>Selecione um arquivo para armazená-lo no seu espaço.</p>
      </div>

      <form className="upload-form" onSubmit={submitUpload}>
        <div
          className={`drop-zone${isDragging ? ' is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <span className="upload-symbol" aria-hidden="true">+</span>
          <div>
            <label className="file-picker" htmlFor="document-file">
              Escolher arquivo
            </label>
            <span className="drop-hint"> ou arraste para esta área</span>
            <input
              ref={inputRef}
              id="document-file"
              type="file"
              onChange={(event) => chooseFile(event.target.files[0])}
            />
            {file && (
              <p className="selected-file" title={file.name}>
                {file.name} <span>{formatSize(file.size)}</span>
              </p>
            )}
          </div>
        </div>

        <button className="primary-button" type="submit" disabled={!file || isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>

      {error && <p className="upload-feedback error-message" role="alert">{error}</p>}
      {message && <p className="upload-feedback success-message" role="status">{message}</p>}
    </section>
  );
}
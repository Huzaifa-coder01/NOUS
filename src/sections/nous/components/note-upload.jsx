import { useRef, useState } from 'react';

import { toast } from 'src/components/snackbar';

import {
  assertPdf,
  MAX_FILE_SIZE,
  handleApiError,
  formatFileSize,
  useUploadFileMutation,
  useCreateNoteMutation,
} from 'src/store';

import { UploadCard, UploadInput, FilePicker, DocButton } from '../styles';

const MAX_MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));

export function NoteUpload({ chapterId }) {
  const inputRef = useRef(null);

  const [uploadFile] = useUploadFileMutation();
  const [createNote] = useCreateNoteMutation();

  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setFile(null);
    setError('');

    if (inputRef.current) inputRef.current.value = '';
  };

  const handlePick = (event) => {
    const picked = event.target.files?.[0] ?? null;

    setError('');

    if (!picked) {
      setFile(null);
      return;
    }

    try {
      assertPdf(picked);
    } catch (pickError) {
      setError(pickError.message);
      setFile(null);
      return;
    }

    setFile(picked);

    if (!name.trim()) setName(picked.name.replace(/\.pdf$/i, ''));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!file) {
      setError('Choose a PDF to upload.');
      return;
    }

    if (!name.trim()) {
      setError('Give this note a name.');
      return;
    }

    setSaving(true);

    try {
      const stored = await uploadFile(file).unwrap();

      await createNote({
        chapterId,
        name: name.trim(),
        file: stored.file,
        fileUrl: stored.fileUrl,
      }).unwrap();

      toast.success('Note uploaded - every student can see it now');
      reset();
    } catch (uploadError) {
      setError(handleApiError(uploadError, 'Could not upload this note'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <UploadCard onSubmit={handleSubmit}>
      <h3>Share your notes</h3>
      <p className="upload-hint">
        Upload a PDF for this chapter. Every PDF needs a name that is not already used anywhere in
        the system, and it becomes visible to all students straight away.
      </p>

      <div className="upload-row">
        <UploadInput
          value={name}
          maxLength={160}
          placeholder="Note name"
          onChange={(event) => setName(event.target.value)}
        />

        <FilePicker>
          <input ref={inputRef} type="file" accept="application/pdf" onChange={handlePick} />
          {file ? '\u{1F4CE} ' : '\u{2B06}\u{FE0F} '}
          {file ? (
            <span className="file-name">
              {file.name} ({formatFileSize(file.size)})
            </span>
          ) : (
            `Choose PDF (max ${MAX_MB}MB)`
          )}
        </FilePicker>

        <DocButton type="submit" variant="primary" disabled={saving}>
          {saving ? 'Uploading...' : 'Upload note'}
        </DocButton>
      </div>

      {!!error && <div className="upload-error">{error}</div>}
    </UploadCard>
  );
}

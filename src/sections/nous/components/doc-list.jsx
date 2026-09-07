import { useState } from 'react';

import { fDate } from 'src/utils/format-time';

import { toast } from 'src/components/snackbar';

import { idOf } from 'src/constants/nous';
import { openFile, fileUrlOf, downloadFile, formatFileSize } from 'src/store';

import { DocList as DocListRoot, DocItem, DocButton, EmptyState } from '../styles';

// ----------------------------------------------------------------------

const ICONS = { 'past-paper': '\u{1F4C4}', syllabus: '\u{1F4CB}', note: '\u{1F4DD}' };

/** The uploader is populated on notes; past papers and syllabus are admin owned. */
function describe(doc) {
  const parts = [];

  if (doc.uploadedBy?.name) parts.push(`Shared by ${doc.uploadedBy.name}`);

  if (doc.createdAt) parts.push(fDate(doc.createdAt));

  const size = formatFileSize(doc.fileSize);

  if (size) parts.push(size);

  return parts.join(' \u00b7 ');
}

// ----------------------------------------------------------------------

function DocRow({ doc }) {
  const [busy, setBusy] = useState(false);

  const missing = !fileUrlOf(doc);

  const run = (action) => () => {
    setBusy(true);

    try {
      action(doc);
    } catch (error) {
      toast.error(error?.message ?? 'Could not open this PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DocItem>
      <div className="doc-icon">{ICONS[doc.kind] ?? '\u{1F4C4}'}</div>

      <div className="doc-body">
        <div className="doc-name" title={doc.name}>
          {doc.name}
        </div>
        <div className="doc-meta">{missing ? 'No file attached' : describe(doc)}</div>
      </div>

      <div className="doc-actions">
        <DocButton
          type="button"
          variant="primary"
          disabled={busy || missing}
          onClick={run(openFile)}
        >
          Open
        </DocButton>
        <DocButton type="button" disabled={busy || missing} onClick={run(downloadFile)}>
          Download
        </DocButton>
      </div>
    </DocItem>
  );
}

// ----------------------------------------------------------------------

/** `docs` is whatever the API returned - a student only ever gets active rows. */
export function DocumentList({ docs, emptyTitle, emptyHint }) {
  if (!docs.length) {
    return (
      <EmptyState>
        <strong>{emptyTitle}</strong>
        {emptyHint}
      </EmptyState>
    );
  }

  return (
    <DocListRoot>
      {docs.map((doc) => (
        <DocRow key={idOf(doc)} doc={doc} />
      ))}
    </DocListRoot>
  );
}

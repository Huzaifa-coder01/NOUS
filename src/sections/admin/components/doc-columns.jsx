import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { openFile, fileUrlOf, fileNameOf, downloadFile, formatFileSize } from 'src/store';

// ----------------------------------------------------------------------

export function DocFileActions({ doc }) {
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

  if (missing) {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        No file
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5}>
      <Button
        size="small"
        color="inherit"
        disabled={busy}
        onClick={run(openFile)}
        startIcon={<Iconify icon="solar:eye-bold" />}
      >
        Open
      </Button>
      <Button size="small" color="inherit" disabled={busy} onClick={run(downloadFile)}>
        Save
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

/** The record's title, then the file name itself - never the storage key. */
export const nameColumn = {
  id: 'name',
  label: 'PDF',
  render: (row) => {
    const caption = [fileNameOf(row), formatFileSize(row.fileSize)]
      .filter(Boolean)
      .join(' \u00b7 ');

    return (
      <>
        <Typography variant="subtitle2">{row.name}</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap title={caption}>
          {caption}
        </Typography>
      </>
    );
  },
};

export const fileColumn = {
  id: 'fileUrl',
  label: 'File',
  width: 170,
  render: (row) => <DocFileActions doc={row} />,
};

export const uploadedColumn = {
  id: 'uploadedBy',
  label: 'Uploaded by',
  width: 200,
  render: (row) => (
    <>
      <Typography variant="body2">{row.uploadedBy?.name ?? 'Unknown'}</Typography>
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {row.uploadedBy?.email ?? row.uploadedBy?.userType ?? 'Student'}
        {row.createdAt ? ` \u00b7 ${fDateTime(row.createdAt)}` : ''}
      </Typography>
    </>
  ),
};

import { useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';

import { Iconify } from 'src/components/iconify';

import { MAX_FILE_SIZE, formatFileSize } from 'src/store';

// ----------------------------------------------------------------------

const MAX_MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));

function FilePickerField({ field, value, error, onChange }) {
  return (
    <Stack spacing={1}>
      <Button
        component="label"
        variant="outlined"
        color={error ? 'error' : 'inherit'}
        startIcon={<Iconify icon="solar:cloud-upload-bold" />}
        sx={{ justifyContent: 'flex-start', py: 1.5 }}
      >
        {value ? value.name : field.label}
        <input
          hidden
          type="file"
          accept="application/pdf"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
      </Button>

      <FormHelperText error={!!error}>
        {error ||
          (value ? formatFileSize(value.size) : field.helperText ?? `PDF only, up to ${MAX_MB}MB`)}
      </FormHelperText>
    </Stack>
  );
}

// ----------------------------------------------------------------------

/**
 * Generic create/edit dialog driven by a field config:
 * `[{ name, label, type?: 'text' | 'number' | 'select' | 'multiline' | 'file',
 *     options?, required?, helperText? }]`
 */
export function EntityDialog({
  open,
  title,
  description,
  fields = [],
  initialValues,
  submitLabel = 'Save',
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues ?? {});
  const [handleApiError, setErrorMessage] = useState('');
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? {});
      setErrorMessage('');
      setFileError('');
      setSubmitting(false);
    }
  }, [open, initialValues]);

  const handleChange = (name) => (event) =>
    setValues((prev) => ({ ...prev, [name]: event.target.value }));

  const handleFile = (field) => (file) => {
    setFileError('');

    if (file && file.type !== 'application/pdf') {
      setFileError('Only PDF files are accepted');
      setValues((prev) => ({ ...prev, [field.name]: null }));
      return;
    }

    if (file && file.size > MAX_FILE_SIZE) {
      setFileError(`This PDF is ${formatFileSize(file.size)} - the limit is ${MAX_MB}MB`);
      setValues((prev) => ({ ...prev, [field.name]: null }));
      return;
    }

    setValues((prev) => ({ ...prev, [field.name]: file }));

    // the file name is the obvious default title
    if (file && !String(values.name ?? '').trim()) {
      setValues((prev) => ({ ...prev, name: file.name.replace(/\.pdf$/i, '') }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      setErrorMessage(error?.message ?? 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {!!description && (
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{description}</Typography>
            )}

            {!!handleApiError && <Alert severity="error">{handleApiError}</Alert>}

            {fields.map((field) =>
              field.type === 'file' ? (
                <FilePickerField
                  key={field.name}
                  field={field}
                  value={values[field.name] ?? null}
                  error={fileError}
                  onChange={handleFile(field)}
                />
              ) : (
                <TextField
                  key={field.name}
                  fullWidth
                  select={field.type === 'select'}
                  multiline={field.type === 'multiline'}
                  minRows={field.type === 'multiline' ? field.minRows ?? 6 : undefined}
                  type={field.type === 'number' ? 'number' : 'text'}
                  label={field.label}
                  required={field.required}
                  helperText={field.helperText}
                  value={values[field.name] ?? ''}
                  onChange={handleChange(field.name)}
                >
                  {field.type === 'select' &&
                    field.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </TextField>
              )
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

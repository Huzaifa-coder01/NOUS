import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

import { AVATAR_ACCEPT, AVATAR_MAX_SIZE, assertAvatar } from 'src/store';

const MAX_MB = Math.round(AVATAR_MAX_SIZE / (1024 * 1024));

export const AVATAR_HELPER_TEXT = `Allowed *.jpeg, *.jpg, *.png, *.gif — max ${MAX_MB} MB`;

export function UploadAvatar({
  value,
  onSelect,
  disabled = false,
  size = 132,
  helperText = AVATAR_HELPER_TEXT,
  error: externalError,
  sx,
  ...other
}) {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // an object url has to be released, or the blob is held for the page's life.
  // keying this on `preview` means one is revoked as soon as it is replaced or
  // cleared, so nothing below has to revoke by hand
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  useEffect(() => {
    if (value) setPreview(null);
  }, [value]);

  const shown = value ?? preview ?? null;

  const message = error || externalError || '';

  const handlePick = useCallback(
    async (event) => {
      const file = event.target.files?.[0] ?? null;

      event.target.value = '';

      if (!file) return;

      setError('');

      try {
        assertAvatar(file);
      } catch (validationError) {
        setError(validationError.message);
        return;
      }

      setPreview(URL.createObjectURL(file));

      if (!onSelect) return;

      setBusy(true);

      try {
        await onSelect(file);
      } catch (uploadError) {
        setError(uploadError?.message ?? 'That image could not be uploaded');

        setPreview(null);
      } finally {
        setBusy(false);
      }
    },
    [onSelect]
  );

  const open = () => {
    if (!disabled && !busy) inputRef.current?.click();
  };

  return (
    <Stack alignItems="center" spacing={1.5} sx={sx} {...other}>
      <Box
        component="button"
        type="button"
        onClick={open}
        disabled={disabled || busy}
        aria-label={shown ? 'Update photo' : 'Upload photo'}
        sx={{
          p: 0,
          width: size,
          height: size,
          cursor: disabled || busy ? 'default' : 'pointer',
          overflow: 'hidden',
          borderRadius: '50%',
          position: 'relative',
          bgcolor: 'background.neutral',
          border: (theme) =>
            `1px dashed ${varAlpha(
              message
                ? theme.vars.palette.error.mainChannel
                : theme.vars.palette.grey['500Channel'],
              message ? 0.64 : 0.32
            )}`,
          transition: (theme) => theme.transitions.create(['border-color', 'opacity']),
          '&:hover': { borderColor: disabled ? undefined : 'primary.main' },
          '&:hover .upload-avatar__overlay': { opacity: shown ? 1 : 0 },
        }}
      >
        {shown && (
          <Box
            component="img"
            src={shown}
            alt=""
            sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}
          />
        )}

        <Stack
          className="upload-avatar__overlay"
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          sx={{
            inset: 0,
            position: 'absolute',
            color: shown ? 'common.white' : 'text.secondary',
            bgcolor: shown
              ? (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.64)
              : 'transparent',
            opacity: shown ? 0 : 1,
            transition: (theme) => theme.transitions.create('opacity'),
          }}
        >
          {busy ? (
            <CircularProgress size={26} color="inherit" />
          ) : (
            <>
              <Iconify icon="solar:camera-add-bold" width={30} />
              <Typography variant="caption" sx={{ fontWeight: 'fontWeightMedium' }}>
                {shown ? 'Update photo' : 'Upload photo'}
              </Typography>
            </>
          )}
        </Stack>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={AVATAR_ACCEPT}
          disabled={disabled || busy}
          onChange={handlePick}
        />
      </Box>

      {(!!helperText || !!message) && (
        <FormHelperText error={!!message} sx={{ textAlign: 'center', mx: 'auto', maxWidth: 240 }}>
          {message || helperText}
        </FormHelperText>
      )}
    </Stack>
  );
}

import { useState, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// ----------------------------------------------------------------------

/**
 * Small feedback helper for the admin screens.
 * Returns `showToast(message, severity)` plus the node to render once per page.
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ message, severity });
  }, []);

  const showError = useCallback((error) => {
    setToast({ message: error?.message ?? 'Something went wrong', severity: 'error' });
  }, []);

  const toastNode = (
    <Snackbar
      open={!!toast}
      autoHideDuration={3500}
      onClose={() => setToast(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={toast?.severity ?? 'success'}
        variant="filled"
        onClose={() => setToast(null)}
      >
        {toast?.message ?? ''}
      </Alert>
    </Snackbar>
  );

  return { showToast, showError, toastNode };
}

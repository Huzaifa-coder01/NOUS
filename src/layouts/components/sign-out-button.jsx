import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { signOut } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, ...other }) {
  const { checkUserSession } = useAuthContext();

  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();

      onClose?.();
      navigate(paths.nous.root);
    } catch (error) {
      console.error('[auth] sign out failed:', error);
    }
  }, [checkUserSession, navigate, onClose]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} {...other}>
      Logout
    </Button>
  );
}

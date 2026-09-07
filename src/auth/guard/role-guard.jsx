import { Navigate, useLocation } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { LoadingScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

/** Requires a valid session AND one of `roles` (defaults to admin only). */
export function RoleGuard({ children, roles = ['admin'] }) {
  const { loading, authenticated, role } = useAuthContext();

  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!authenticated) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);

    return <Navigate to={`${paths.auth.jwt.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to={paths.nous.root} replace />;
  }

  return children;
}

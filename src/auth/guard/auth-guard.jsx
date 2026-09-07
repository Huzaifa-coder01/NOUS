import { Navigate, useLocation } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { LoadingScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

/** Requires a valid session; bounces to sign in and remembers where to return. */
export function AuthGuard({ children }) {
  const { loading, authenticated } = useAuthContext();

  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!authenticated) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);

    return <Navigate to={`${paths.auth.jwt.signIn}?returnTo=${returnTo}`} replace />;
  }

  return children;
}

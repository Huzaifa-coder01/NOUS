import { Navigate, useSearchParams } from 'react-router-dom';

import { LoadingScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';
import { getLandingPath } from '../utils';

// ----------------------------------------------------------------------

/** Keeps signed-in visitors out of the sign in / sign up pages. */
export function GuestGuard({ children }) {
  const { loading, authenticated, role } = useAuthContext();

  const [searchParams] = useSearchParams();

  if (loading) {
    return <LoadingScreen />;
  }

  if (authenticated) {
    return <Navigate to={getLandingPath(role, searchParams.get('returnTo'))} replace />;
  }

  return children;
}

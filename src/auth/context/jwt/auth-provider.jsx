import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';

import { flattenUser, selectRawUser, useGetMyProfileQuery } from 'src/store';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

/**
 * The session comes from the persisted `user` slice, so a reload is already
 * signed in before any request goes out.
 *
 * `GET /auth/me` then runs behind it to confirm the token is still good and to
 * pick up a role change or a disabled account. A 401 anywhere clears the slice
 * from inside the base query, which flows straight back through here.
 */
export function AuthProvider({ children }) {
  const stored = useSelector(selectRawUser);

  const hasToken = !!stored?.token;

  const {
    data: profile,
    isLoading,
    isUninitialized,
    refetch,
  } = useGetMyProfileQuery(undefined, { skip: !hasToken });

  /**
   * A best-effort revalidation after a sign in or a profile change.
   *
   * Signing in fills the slice, which un-skips the query above and starts it
   * anyway, and RTK Query throws when asked to refetch a query that never
   * started or whose cache was just reset - neither is a real problem here, so
   * this never rejects.
   */
  const checkUserSession = useCallback(async () => {
    if (!hasToken || isUninitialized) return;

    try {
      await refetch();
    } catch {
      // the query will fetch on its own once it is subscribed again
    }
  }, [hasToken, isUninitialized, refetch]);

  const memoizedValue = useMemo(() => {
    // the profile is the fresher copy, but only the stored record has the token
    const merged = hasToken ? { ...stored, ...(profile ?? {}) } : null;

    const user = flattenUser(merged);

    return {
      user,
      role: user?.role ?? null,
      isAdmin: user?.role === 'admin',
      // a stored session renders straight away; /auth/me revalidates behind it
      loading: hasToken && isLoading && !stored,
      authenticated: hasToken,
      unauthenticated: !hasToken,
      checkUserSession,
    };
  }, [stored, profile, hasToken, isLoading, checkUserSession]);

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

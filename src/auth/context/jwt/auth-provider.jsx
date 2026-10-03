import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';

import { flattenUser, selectRawUser, useGetMyProfileQuery } from 'src/store';

import { AuthContext } from '../auth-context';

export function AuthProvider({ children }) {
  const stored = useSelector(selectRawUser);

  const hasToken = !!stored?.token;

  const {
    data: profile,
    isLoading,
    isUninitialized,
    refetch,
  } = useGetMyProfileQuery(undefined, { skip: !hasToken });

  const checkUserSession = useCallback(async () => {
    if (!hasToken || isUninitialized) return;

    try {
      await refetch();
    } catch {
    }
  }, [hasToken, isUninitialized, refetch]);

  const memoizedValue = useMemo(() => {
    const merged = hasToken ? { ...stored, ...(profile ?? {}) } : null;

    const user = flattenUser(merged);

    return {
      user,
      role: user?.role ?? null,
      isAdmin: user?.role === 'admin',
      loading: hasToken && isLoading && !stored,
      authenticated: hasToken,
      unauthenticated: !hasToken,
      checkUserSession,
    };
  }, [stored, profile, hasToken, isLoading, checkUserSession]);

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

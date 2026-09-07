import { useState, useCallback } from 'react';

import { handleApiError } from 'src/store';

// ----------------------------------------------------------------------

/**
 * Adapts an RTK Query list hook to what the admin tables need.
 *
 * The server owns filtering and paging, so the only thing held locally is the
 * query itself - page, rows per page, keyword and status - which is fed
 * straight back into the hook as its argument. RTK Query caches per argument,
 * so paging back to a page already seen is instant and revalidates behind.
 *
 *   const list = useListQuery(useGetLevelsQuery, { courseId });
 */
export function useListQuery(useQueryHook, extraArgs = {}, { limit = 10 } = {}) {
  const [query, setQuery] = useState({ page: 1, limit, keyword: '', status: '' });

  const result = useQueryHook({ ...query, ...extraArgs });

  const setPage = useCallback((page) => setQuery((q) => ({ ...q, page })), []);

  const setLimit = useCallback((next) => setQuery((q) => ({ ...q, limit: next, page: 1 })), []);

  const setKeyword = useCallback((keyword) => setQuery((q) => ({ ...q, keyword, page: 1 })), []);

  const setStatus = useCallback((status) => setQuery((q) => ({ ...q, status, page: 1 })), []);

  const reset = useCallback(() => setQuery({ page: 1, limit, keyword: '', status: '' }), [limit]);

  return {
    rows: result.data?.rows ?? [],
    total: result.data?.total ?? 0,
    counts: result.data?.counts ?? null,
    meta: result.data?.meta ?? null,
    // `isFetching` stays true while a background revalidation runs, which is
    // what should drive the thin progress bar rather than the first load only
    loading: result.isLoading || result.isFetching,
    error: result.error ? { ...result.error, message: handleApiError(result.error) } : null,
    refresh: result.refetch,
    query,
    setPage,
    setLimit,
    setKeyword,
    setStatus,
    reset,
  };
}

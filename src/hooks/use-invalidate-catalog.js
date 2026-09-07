import { useDispatch } from 'react-redux';
import { useCallback } from 'react';

import { invalidateCatalog } from 'src/store';

// ----------------------------------------------------------------------

/**
 * Deactivating or deleting a course, level, subject or chapter cascades to
 * every descendant on the server, so rows in the other catalog and document
 * apis change too. Cache tags cannot cross a `createApi` boundary, so the
 * screens that perform a cascading write call this afterwards.
 */
export function useInvalidateCatalog() {
  const dispatch = useDispatch();

  return useCallback(() => dispatch(invalidateCatalog()), [dispatch]);
}

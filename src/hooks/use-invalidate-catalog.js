import { useDispatch } from 'react-redux';
import { useCallback } from 'react';

import { invalidateCatalog } from 'src/store';

export function useInvalidateCatalog() {
  const dispatch = useDispatch();

  return useCallback(() => dispatch(invalidateCatalog()), [dispatch]);
}

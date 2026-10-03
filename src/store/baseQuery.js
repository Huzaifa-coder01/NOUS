import { fetchBaseQuery } from '@reduxjs/toolkit/query';

import { CONFIG } from 'src/config-global';

import { logout } from './slices/userSlice';
import { handleApiError } from './handleApiError';

export const createCustomFetchBaseQuery = () => {
  const baseQuery = fetchBaseQuery({
    baseUrl: CONFIG.api.baseUrl,
    timeout: CONFIG.api.timeout,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.user?.user?.token;

      if (token) headers.set('Authorization', `Bearer ${token}`);

      headers.set('Accept', 'application/json');

      return headers;
    },
  });

  return async (arg, api, extraOptions) => {
    const result = await baseQuery(arg, api, extraOptions);

    if (result.error) {
      const { status } = result.error;

      if (typeof status === 'number') {
        console.error('[api]', handleApiError(result.error));
      } else {
        console.warn('[api]', handleApiError(result.error));
      }

      if (status === 401) {
        const onAuthPage =
          typeof window !== 'undefined' && window.location.pathname.startsWith('/auth');

        if (!onAuthPage) api.dispatch(logout());
      }
    }

    return result;
  };
};

export function unwrap(response) {
  if (response == null || typeof response !== 'object') return response;

  return 'data' in response ? response.data : response;
}

export function unwrapList(response) {
  const data = unwrap(response);

  const rows = Array.isArray(data) ? data : data?.rows ?? data?.results ?? [];

  const meta = response?.meta ?? null;

  const counters = meta
    ? Object.values(meta).find(
        (value) => value && typeof value === 'object' && value.totalRecord != null
      )
    : null;

  return {
    rows,
    meta,
    total: Number(meta?.totalRecords ?? meta?.totalRecord ?? rows.length),
    page: Number(meta?.currentPage ?? 1),
    totalPages: Number(meta?.totalPages ?? 1),
    counts: counters
      ? {
          total: Number(counters.totalRecord ?? 0),
          active: Number(counters.active ?? 0),
          inactive: Number(counters.inactive ?? 0),
          deleted: Number(counters.deleted ?? 0),
        }
      : null,
  };
}

export function params(query = {}) {
  return Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, createCustomFetchBaseQuery } from '../baseQuery';

export const dashboardApi = createApi({
  reducerPath: 'dashboard',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Dashboard'],
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => ({ url: API_ROUTES.DASHBOARD.SUMMARY, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Dashboard'],
    }),

    logEngagement: builder.mutation({
      query: ({ entityType, entityId, eventType = 'view' }) => ({
        url: API_ROUTES.DASHBOARD.LOG_ENGAGEMENT,
        method: 'POST',
        body: { entityType, entityId, eventType },
      }),
    }),

    getTrending: builder.query({
      query: (query) => ({
        url: API_ROUTES.DASHBOARD.TRENDING,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrap,
    }),

    getLeads: builder.query({
      query: (query) => ({
        url: API_ROUTES.DASHBOARD.LEADS,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrap,
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useLogEngagementMutation,
  useGetTrendingQuery,
  useGetLeadsQuery,
} = dashboardApi;

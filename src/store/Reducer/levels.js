import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

export const levelsApi = createApi({
  reducerPath: 'levels',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Levels'],
  endpoints: (builder) => ({
    getLevels: builder.query({
      query: (query) => ({
        url: API_ROUTES.LEVELS.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrapList,
      providesTags: ['Levels'],
    }),

    getLevel: builder.query({
      query: (id) => ({ url: API_ROUTES.LEVELS.DETAILS(id), method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Levels'],
    }),

    createLevel: builder.mutation({
      query: ({ courseId, name, emoji }) => ({
        url: API_ROUTES.LEVELS.CREATE,
        method: 'POST',
        body: { courseId, name: String(name).trim(), emoji },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Levels'],
    }),

    updateLevel: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.LEVELS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Levels'],
    }),

    deleteLevel: builder.mutation({
      query: (id) => ({ url: API_ROUTES.LEVELS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Levels'],
    }),
  }),
});

export const {
  useGetLevelsQuery,
  useGetLevelQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
} = levelsApi;

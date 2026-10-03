import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

export const subjectsApi = createApi({
  reducerPath: 'subjects',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Subjects'],
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: (query) => ({
        url: API_ROUTES.SUBJECTS.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrapList,
      providesTags: ['Subjects'],
    }),

    getSubject: builder.query({
      query: (id) => ({ url: API_ROUTES.SUBJECTS.DETAILS(id), method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Subjects'],
    }),

    createSubject: builder.mutation({
      query: ({ levelId, name, emoji }) => ({
        url: API_ROUTES.SUBJECTS.CREATE,
        method: 'POST',
        body: { levelId, name: String(name).trim(), emoji },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Subjects'],
    }),

    updateSubject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.SUBJECTS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Subjects'],
    }),

    deleteSubject: builder.mutation({
      query: (id) => ({ url: API_ROUTES.SUBJECTS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Subjects'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;

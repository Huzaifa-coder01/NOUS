import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Subjects - a subject hangs off a level.
//
// Create takes `levelId` only; the course is derived from it. Rows carry
// `level` with its `course` nested, plus `contentCount`
// { activeChapters, activePastPapers }.
//
// ----------------------------------------------------------------------

export const subjectsApi = createApi({
  reducerPath: 'subjects',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Subjects'],
  endpoints: (builder) => ({
    // List - page / limit / keyword / status plus the parent ids that narrow it
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

    /** `status` accepts active | inactive here; `deleted` is what DELETE sets. */
    updateSubject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.SUBJECTS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Subjects'],
    }),

    /** A soft delete: the record is marked deleted and its children deactivated. */
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

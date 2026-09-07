import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Chapters - the leaves of the catalog.
//
// `chapterNumber` is a whole number from 1, unique inside the subject. Rows
// come back sorted by it, carry the full subject > level > course chain, and
// carry `contentCount` { activeSyllabus, activeNotes, activePastPapers } - the
// three numbers the chapter screen shows.
//
// ----------------------------------------------------------------------

export const chaptersApi = createApi({
  reducerPath: 'chapters',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Chapters'],
  endpoints: (builder) => ({
    // List - page / limit / keyword / status plus the parent ids that narrow it
    getChapters: builder.query({
      query: (query) => ({
        url: API_ROUTES.CHAPTERS.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrapList,
      providesTags: ['Chapters'],
    }),

    getChapter: builder.query({
      query: (id) => ({ url: API_ROUTES.CHAPTERS.DETAILS(id), method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Chapters'],
    }),

    createChapter: builder.mutation({
      query: ({ subjectId, chapterNumber, name }) => ({
        url: API_ROUTES.CHAPTERS.CREATE,
        method: 'POST',
        body: {
          subjectId,
          chapterNumber: Number(chapterNumber),
          name: String(name).trim(),
        },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Chapters'],
    }),

    /** `status` accepts active | inactive here; `deleted` is what DELETE sets. */
    updateChapter: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.CHAPTERS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Chapters'],
    }),

    /** A soft delete: the record is marked deleted and its children deactivated. */
    deleteChapter: builder.mutation({
      query: (id) => ({ url: API_ROUTES.CHAPTERS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Chapters'],
    }),
  }),
});

export const {
  useGetChaptersQuery,
  useGetChapterQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chaptersApi;

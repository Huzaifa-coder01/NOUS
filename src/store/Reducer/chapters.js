import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

export const chaptersApi = createApi({
  reducerPath: 'chapters',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Chapters'],
  endpoints: (builder) => ({
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

    updateChapter: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.CHAPTERS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Chapters'],
    }),

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

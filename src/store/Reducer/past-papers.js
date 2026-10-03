import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

export const pastPapersApi = createApi({
  reducerPath: 'pastPapers',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['PastPapers'],
  endpoints: (builder) => ({
    getPastPapers: builder.query({
      query: (query) => ({
        url: API_ROUTES.PAST_PAPERS.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrapList,
      providesTags: ['PastPapers'],
    }),

    getPastPaper: builder.query({
      query: (id) => ({ url: API_ROUTES.PAST_PAPERS.DETAILS(id), method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['PastPapers'],
    }),

    createPastPaper: builder.mutation({
      query: ({ subjectId, chapterId, name, file, fileUrl }) => ({
        url: API_ROUTES.PAST_PAPERS.CREATE,
        method: 'POST',
        body: {
          subjectId,
          ...(chapterId ? { chapterId } : {}),
          name: String(name).trim(),
          file,
          fileUrl,
        },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['PastPapers'],
    }),

    updatePastPaper: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.PAST_PAPERS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['PastPapers'],
    }),

    deletePastPaper: builder.mutation({
      query: (id) => ({ url: API_ROUTES.PAST_PAPERS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['PastPapers'],
    }),
  }),
});

export const {
  useGetPastPapersQuery,
  useGetPastPaperQuery,
  useCreatePastPaperMutation,
  useUpdatePastPaperMutation,
  useDeletePastPaperMutation,
} = pastPapersApi;

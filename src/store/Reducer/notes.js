import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

export const notesApi = createApi({
  reducerPath: 'notes',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Notes'],
  endpoints: (builder) => ({
    getNotes: builder.query({
      query: (query) => ({
        url: API_ROUTES.NOTES.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrapList,
      providesTags: ['Notes'],
    }),

    getNote: builder.query({
      query: (id) => ({ url: API_ROUTES.NOTES.DETAILS(id), method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Notes'],
    }),

    createNote: builder.mutation({
      query: ({ chapterId, name, file, fileUrl }) => ({
        url: API_ROUTES.NOTES.CREATE,
        method: 'POST',
        body: { chapterId, name: String(name).trim(), file, fileUrl },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Notes'],
    }),

    updateNote: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.NOTES.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Notes'],
    }),

    deleteNote: builder.mutation({
      query: (id) => ({ url: API_ROUTES.NOTES.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Notes'],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useGetNoteQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApi;

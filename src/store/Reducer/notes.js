import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Student notes - the one thing a student may upload.
//
// A new note is active straight away, so every student browsing the chapter
// sees it, not just the uploader. `?mine=true` narrows the list to the signed
// in student's own uploads; only an admin may rename, deactivate or delete.//
// A PDF is created by uploading the file first (see `uploads.js`) and passing
// the returned `file` key and `fileUrl` here. Names are unique across every PDF
// in the system, which is the 409 these mutations most often surface.
// ----------------------------------------------------------------------

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

    /** `status` accepts active | inactive; `deleted` is what DELETE sets. */
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

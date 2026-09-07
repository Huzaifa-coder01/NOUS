import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Syllabus PDFs - always attached to a chapter.
//
// Course, level and subject are derived from the chapter, so a create only
// needs `chapterId`.//
// A PDF is created by uploading the file first (see `uploads.js`) and passing
// the returned `file` key and `fileUrl` here. Names are unique across every PDF
// in the system, which is the 409 these mutations most often surface.
// ----------------------------------------------------------------------

export const syllabusApi = createApi({
  reducerPath: 'syllabus',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Syllabus'],
  endpoints: (builder) => ({
    getSyllabusList: builder.query({
      query: (query) => ({
        url: API_ROUTES.SYLLABUS.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrapList,
      providesTags: ['Syllabus'],
    }),

    getSyllabus: builder.query({
      query: (id) => ({ url: API_ROUTES.SYLLABUS.DETAILS(id), method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Syllabus'],
    }),

    createSyllabus: builder.mutation({
      query: ({ chapterId, name, file, fileUrl }) => ({
        url: API_ROUTES.SYLLABUS.CREATE,
        method: 'POST',
        body: { chapterId, name: String(name).trim(), file, fileUrl },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Syllabus'],
    }),

    /** `status` accepts active | inactive; `deleted` is what DELETE sets. */
    updateSyllabus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.SYLLABUS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Syllabus'],
    }),

    deleteSyllabus: builder.mutation({
      query: (id) => ({ url: API_ROUTES.SYLLABUS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Syllabus'],
    }),
  }),
});

export const {
  useGetSyllabusListQuery,
  useGetSyllabusQuery,
  useCreateSyllabusMutation,
  useUpdateSyllabusMutation,
  useDeleteSyllabusMutation,
} = syllabusApi;

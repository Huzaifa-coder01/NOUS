import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

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

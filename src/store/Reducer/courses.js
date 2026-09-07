import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Courses - the top of the catalog.
//
// `name` is required and unique among non-deleted courses. Rows carry
// `contentCount` { activeLevels, activeSubjects }, and a student only ever
// gets active rows back.
//
// ----------------------------------------------------------------------

export const coursesApi = createApi({
  reducerPath: 'courses',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Courses'],
  endpoints: (builder) => ({
    // List - page / limit / keyword / status plus the parent ids that narrow it
    getCourses: builder.query({
      query: (query) => ({
        url: API_ROUTES.COURSES.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrapList,
      providesTags: ['Courses'],
    }),

    getCourse: builder.query({
      query: (id) => ({ url: API_ROUTES.COURSES.DETAILS(id), method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Courses'],
    }),

    createCourse: builder.mutation({
      query: ({ name, description, emoji }) => ({
        url: API_ROUTES.COURSES.CREATE,
        method: 'POST',
        body: { name: String(name).trim(), description, emoji },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Courses'],
    }),

    /** `status` accepts active | inactive here; `deleted` is what DELETE sets. */
    updateCourse: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.COURSES.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Courses'],
    }),

    /** A soft delete: the record is marked deleted and its children deactivated. */
    deleteCourse: builder.mutation({
      query: (id) => ({ url: API_ROUTES.COURSES.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Courses'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = coursesApi;

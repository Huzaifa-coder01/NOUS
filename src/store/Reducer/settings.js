import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { params, unwrap, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Settings and the help centre.
//
// There is no single "get settings" call - each document has its own GET, and
// create / update take them all together.
// ----------------------------------------------------------------------

export const settingsApi = createApi({
  reducerPath: 'settings',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Settings', 'HelpCenter'],
  endpoints: (builder) => ({
    getTermsConditions: builder.query({
      query: () => ({ url: API_ROUTES.SETTINGS.TERMS, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Settings'],
    }),

    getCustomerTermsConditions: builder.query({
      query: () => ({ url: API_ROUTES.SETTINGS.CUSTOMER_TERMS, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Settings'],
    }),

    getPrivacyPolicy: builder.query({
      query: () => ({ url: API_ROUTES.SETTINGS.PRIVACY_POLICY, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Settings'],
    }),

    getAboutUs: builder.query({
      query: () => ({ url: API_ROUTES.SETTINGS.ABOUT_US, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Settings'],
    }),

    getFaqs: builder.query({
      query: () => ({ url: API_ROUTES.SETTINGS.FAQS, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Settings'],
    }),

    createSettings: builder.mutation({
      query: (body) => ({ url: API_ROUTES.SETTINGS.CREATE, method: 'POST', body }),
      transformResponse: unwrap,
      invalidatesTags: ['Settings'],
    }),

    updateSettings: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.SETTINGS.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Settings'],
    }),

    getHelpCenter: builder.query({
      query: (query) => ({
        url: API_ROUTES.HELP_CENTER.ALL,
        method: 'GET',
        params: params(query),
      }),
      transformResponse: unwrap,
      providesTags: ['HelpCenter'],
    }),

    createHelpCenter: builder.mutation({
      query: (body) => ({ url: API_ROUTES.HELP_CENTER.CREATE, method: 'POST', body }),
      transformResponse: unwrap,
      invalidatesTags: ['HelpCenter'],
    }),

    updateHelpCenter: builder.mutation({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.HELP_CENTER.UPDATE(id),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: ['HelpCenter'],
    }),

    deleteHelpCenter: builder.mutation({
      query: (id) => ({ url: API_ROUTES.HELP_CENTER.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['HelpCenter'],
    }),
  }),
});

export const {
  useGetTermsConditionsQuery,
  useGetCustomerTermsConditionsQuery,
  useGetPrivacyPolicyQuery,
  useGetAboutUsQuery,
  useGetFaqsQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
  useGetHelpCenterQuery,
  useCreateHelpCenterMutation,
  useUpdateHelpCenterMutation,
  useDeleteHelpCenterMutation,
} = settingsApi;

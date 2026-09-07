import { createApi } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { getDeviceId } from './auth';
import { API_ROUTES } from '../apiRoutes';
import { flattenUser } from '../slices/userSlice';
import { params, unwrap, unwrapList, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Users (admin). `userType` filters student | admin.
//
// The backend nests a user record - basicInfo / accountState / metadata - so
// rows are flattened here rather than in every table that shows one.
// ----------------------------------------------------------------------

const flattenRows = (response) => {
  const list = unwrapList(response);

  return { ...list, rows: list.rows.map(flattenUser) };
};

export const usersApi = createApi({
  reducerPath: 'users',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (query) => ({ url: API_ROUTES.USERS.ALL, method: 'GET', params: params(query) }),
      transformResponse: flattenRows,
      providesTags: ['Users'],
    }),

    getUser: builder.query({
      query: (id) => ({ url: API_ROUTES.USERS.DETAILS(id), method: 'GET' }),
      transformResponse: (response) => flattenUser(unwrap(response)),
      providesTags: ['Users'],
    }),

    createUser: builder.mutation({
      query: ({ name, email, password, userType = 'student' }) => ({
        url: API_ROUTES.USERS.CREATE,
        method: 'POST',
        body: {
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          password,
          userType,
          deviceId: getDeviceId(),
          deviceType: CONFIG.api.deviceType,
        },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({ url: API_ROUTES.USERS.UPDATE(id), method: 'PUT', body }),
      transformResponse: unwrap,
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({ url: API_ROUTES.USERS.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),

    setupTwoFactor: builder.mutation({
      query: () => ({ url: API_ROUTES.USERS.TWO_FA_SETUP, method: 'POST' }),
      transformResponse: unwrap,
    }),

    confirmTwoFactor: builder.mutation({
      query: (token) => ({
        url: API_ROUTES.USERS.TWO_FA_CONFIRM,
        method: 'POST',
        body: { token },
      }),
      transformResponse: unwrap,
    }),

    disableTwoFactor: builder.mutation({
      query: (token) => ({
        url: API_ROUTES.USERS.TWO_FA_DISABLE,
        method: 'POST',
        body: { token },
      }),
      transformResponse: unwrap,
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSetupTwoFactorMutation,
  useConfirmTwoFactorMutation,
  useDisableTwoFactorMutation,
} = usersApi;

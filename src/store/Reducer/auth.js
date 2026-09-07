import { createApi } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { API_ROUTES } from '../apiRoutes';
import { unwrap, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Auth.
//
// Sign up is register -> OTP by email -> verify: register leaves the account
// `pending` and only a verified account may log in. An admin login also needs
// the `x-admin-access-token` header.
//
// `deviceId` / `deviceType` are required on register, login and logout.
// ----------------------------------------------------------------------

const ADMIN_ACCESS_TOKEN = CONFIG.api.adminAccessToken;

/** A stable per-browser id; the backend keys its session records on it. */
export function getDeviceId() {
  const key = 'nous.deviceId';

  try {
    const existing = localStorage.getItem(key);

    if (existing) return existing;

    const fresh = `web-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

    localStorage.setItem(key, fresh);

    return fresh;
  } catch {
    return 'web-anonymous';
  }
}

const device = () => ({ deviceId: getDeviceId(), deviceType: CONFIG.api.deviceType });

/**
 * The admin gate header. The backend rejects an admin login without it and
 * ignores it for a student, so it goes on every login and one form serves both
 * roles.
 */
const adminHeaders = () =>
  ADMIN_ACCESS_TOKEN ? { 'x-admin-access-token': ADMIN_ACCESS_TOKEN } : undefined;

const asEmail = (value) => String(value).trim().toLowerCase();

/** Register rejects an account with no picture, so one stands in for it. */
const DEFAULT_PROFILE_ICON = 'nous/dev/sample.png';

export const authApi = createApi({
  reducerPath: 'auth',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    /**
     * `profileIcon` is required by the backend, so a default key is sent when
     * the form does not collect one.
     */
    register: builder.mutation({
      query: ({ name, email, password, profileIcon }) => ({
        url: API_ROUTES.AUTH.REGISTER,
        method: 'POST',
        body: {
          name: String(name).trim(),
          email: asEmail(email),
          password,
          userType: 'student',
          profileIcon: profileIcon || DEFAULT_PROFILE_ICON,
          ...device(),
        },
      }),
      transformResponse: unwrap,
    }),

    /** In dev the backend returns the OTP in the body, which the UI shows. */
    resendEmailOtp: builder.mutation({
      query: ({ email, purpose = 'generic' }) => ({
        url: API_ROUTES.AUTH.RESEND_OTP_EMAIL,
        method: 'POST',
        body: { email: asEmail(email), purpose },
      }),
      transformResponse: unwrap,
    }),

    /** Verifies the email, activates the account and returns a token. */
    verifyEmailOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: API_ROUTES.AUTH.VERIFY_OTP_EMAIL,
        method: 'POST',
        body: { email: asEmail(email), otp: String(otp).trim() },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Profile'],
    }),

    /** Returns the whole account record with `token` on it. */
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        headers: adminHeaders(),
        body: { email: asEmail(email), password, ...device() },
      }),
      transformResponse: unwrap,
      invalidatesTags: ['Profile'],
    }),

    getMyProfile: builder.query({
      query: () => ({ url: API_ROUTES.AUTH.ME, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Profile'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: API_ROUTES.AUTH.LOGOUT,
        method: 'POST',
        body: { deviceId: getDeviceId() },
      }),
      invalidatesTags: ['Profile'],
    }),

    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: API_ROUTES.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body: { email: asEmail(email) },
      }),
      transformResponse: unwrap,
    }),

    /** `resetToken` is what verifying the OTP returned. */
    resetPassword: builder.mutation({
      query: ({ email, newPassword, resetToken }) => ({
        url: API_ROUTES.AUTH.RESET_PASSWORD,
        method: 'POST',
        body: { email: asEmail(email), newPassword, resetToken },
      }),
      transformResponse: unwrap,
    }),

    changePassword: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.AUTH.CHANGE_PASSWORD,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap,
    }),

    checkEmailExists: builder.mutation({
      query: ({ email }) => ({
        url: API_ROUTES.AUTH.CHECK_EMAIL_EXISTS,
        method: 'POST',
        body: { email: asEmail(email) },
      }),
      transformResponse: unwrap,
    }),

    deleteAccount: builder.mutation({
      query: () => ({ url: API_ROUTES.AUTH.DELETE_ACCOUNT, method: 'DELETE' }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useResendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useLoginMutation,
  useGetMyProfileQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useCheckEmailExistsMutation,
  useDeleteAccountMutation,
} = authApi;

import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

/**
 * The signed-in account, persisted so a reload keeps the session.
 *
 * The backend nests its user record - `basicInfo`, `accountState`, `metadata` -
 * and returns the token alongside them on login, so the whole payload is kept
 * as-is and the selectors below flatten what the UI actually reads.
 */
const userSlice = createSlice({
  name: 'user',
  initialState: { user: null },

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload ? { ...action.payload } : null;
    },

    /** Merges a fresh `/auth/me` over the stored record, keeping the token. */
    setProfile: (state, action) => {
      if (!state.user) return;

      state.user = { ...state.user, ...action.payload, token: state.user.token };
    },

    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setProfile, logout } = userSlice.actions;

export default userSlice.reducer;

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------

export const selectRawUser = (state) => state.user.user;

export const selectToken = (state) => state.user.user?.token ?? null;

/** The backend calls an admin `admin`; everything else is a student. */
export function roleOf(user) {
  return user?.accountState?.userType === 'admin' ? 'admin' : 'user';
}

/** Flattens the nested record into the handful of fields the UI shows. */
export function flattenUser(user) {
  if (!user) return null;

  const { basicInfo = {}, accountState = {}, metadata = {} } = user;

  return {
    _id: basicInfo._id ?? user._id ?? null,
    name: basicInfo.name ?? '',
    email: basicInfo.email ?? '',
    profileIcon: basicInfo.profileIcon ?? '',
    userType: accountState.userType ?? 'student',
    role: roleOf(user),
    status: accountState.status ?? 'active',
    emailVerified: accountState.verificationStatus?.email === 'verified',
    createdAt: metadata.createdAt ?? null,
    token: user.token ?? null,
  };
}

export const selectUser = (state) => flattenUser(state.user.user);

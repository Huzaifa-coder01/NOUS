import { store, ApiError, authApi, setUser, logout, resetAllApiState } from 'src/store';

async function run(endpoint, args, fallback) {
  try {
    return await store.dispatch(endpoint.initiate(args)).unwrap();
  } catch (error) {
    throw new ApiError(error, fallback);
  }
}

const {
  login,
  register,
  resendEmailOtp,
  verifyEmailOtp,
  forgotPassword,
  resetPassword: reset,
} = authApi.endpoints;

export async function signIn({ email, password }) {
  let data;

  try {
    data = await store.dispatch(login.initiate({ email, password })).unwrap();
  } catch (error) {
    const failure = new ApiError(error, 'Could not sign you in');

    if (failure.data?.data?.isEmailVerified === false) {
      remember(SIGNUP_KEY, { email, otp: null });

      await resendSignUpOtp().catch(() => null);

      failure.needsEmailVerification = true;
    }

    throw failure;
  }

  if (!data?.token) throw new Error('The server did not return a session token');

  store.dispatch(setUser(data));

  return data;
}

const SIGNUP_KEY = 'nous.pendingSignUp';

const RESET_KEY = 'nous.passwordReset';

function remember(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
  }

  return value;
}

function recall(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key)) ?? null;
  } catch {
    return null;
  }
}

function forget(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
  }
}

export function getPendingSignUp() {
  return recall(SIGNUP_KEY);
}

export async function signUp({ name, email, password, profileIcon }) {
  const created = await run(
    register,
    { name, email, password, profileIcon },
    'Could not create your account'
  );

  const otp = created?.otpInfo?.emailOtp?.otp ?? created?.otp ?? null;

  return remember(SIGNUP_KEY, { email, otp });
}

export async function resendSignUpOtp() {
  const pending = getPendingSignUp();

  if (!pending?.email) throw new Error('Start again from sign up');

  const sent = await run(
    resendEmailOtp,
    { email: pending.email, purpose: 'generic' },
    'Could not send a new code'
  );

  return remember(SIGNUP_KEY, { ...pending, otp: sent?.otp ?? null });
}

export async function verifySignUpOtp({ otp }) {
  const pending = getPendingSignUp();

  if (!pending?.email) throw new Error('Start again from sign up');

  const data = await run(
    verifyEmailOtp,
    { email: pending.email, otp },
    'That code could not be verified'
  );

  if (!data?.token) throw new Error('That code could not be verified');

  store.dispatch(setUser(data));
  forget(SIGNUP_KEY);

  return data;
}

export async function signOut() {
  await store
    .dispatch(authApi.endpoints.logout.initiate())
    .unwrap()
    .catch(() => null);

  store.dispatch(logout());
  store.dispatch(resetAllApiState());
}

export function getPendingReset() {
  return recall(RESET_KEY);
}

export async function requestPasswordReset({ email }) {
  const data = await run(forgotPassword, { email }, 'Could not send a reset code');

  return remember(RESET_KEY, { email, otp: data?.otp ?? null });
}

export async function verifyResetCode({ code }) {
  const pending = getPendingReset();

  if (!pending?.email) throw new Error('Request a new reset code');

  const data = await run(
    verifyEmailOtp,
    { email: pending.email, otp: code },
    'That code could not be verified'
  );

  const resetToken = data?.resetToken ?? data?.token;

  if (!resetToken) throw new Error('That code could not be verified');

  remember(RESET_KEY, { ...pending, resetToken });

  return true;
}

export async function resetPassword({ password }) {
  const pending = getPendingReset();

  if (!pending?.resetToken) throw new Error('Verify your reset code first');

  await run(
    reset,
    { email: pending.email, newPassword: password, resetToken: pending.resetToken },
    'Could not reset your password'
  );

  forget(RESET_KEY);

  return true;
}

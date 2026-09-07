import { store, ApiError, authApi, setUser, logout, resetAllApiState } from 'src/store';

// ----------------------------------------------------------------------
// Auth actions.
//
// These run outside React (form submit handlers, the sign-out button), so they
// drive the endpoints imperatively with `initiate` rather than the generated
// hooks. The signed-in account lives in the persisted `user` slice, which is
// also where the base query reads the bearer token from.
// ----------------------------------------------------------------------

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

/** **************************************
 * Sign in
 *
 * One request for both roles: the login endpoint always carries the admin gate
 * header, which the backend requires for an admin and ignores for a student.
 *
 * The response is the whole account record with the token on it, so it goes
 * into the slice as-is.
 *************************************** */
export async function signIn({ email, password }) {
  let data;

  try {
    data = await store.dispatch(login.initiate({ email, password })).unwrap();
  } catch (error) {
    const failure = new ApiError(error, 'Could not sign you in');

    // the credentials are fine but the account was never verified; the backend
    // says so with `isEmailVerified`, so finish that instead of dead-ending on
    // an error the person cannot act on from here
    if (failure.data?.data?.isEmailVerified === false) {
      remember(SIGNUP_KEY, { email, otp: null });

      // the code from sign up has almost certainly expired, so the screen they
      // land on gets a fresh one; if the resend is refused they can ask again
      await resendSignUpOtp().catch(() => null);

      failure.needsEmailVerification = true;
    }

    throw failure;
  }

  if (!data?.token) throw new Error('The server did not return a session token');

  store.dispatch(setUser(data));

  return data;
}

/** **************************************
 * Sign up.
 *
 * Register creates the account as *pending* and emails an OTP - there is no
 * session yet, so the caller sends the user to the verify screen rather than
 * into the app. On localhost the OTP comes back in the body, which the verify
 * screen shows.
 *************************************** */
const SIGNUP_KEY = 'nous.pendingSignUp';

const RESET_KEY = 'nous.passwordReset';

function remember(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // non-fatal: the screen asks for the email again
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
    // nothing to clean up
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

  // register nests the code under otpInfo; a resend returns it at the top
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

/** Verifying flips the account to active and returns the session token. */
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

/** **************************************
 * Sign out
 *************************************** */
export async function signOut() {
  // the session record is keyed on deviceId server side; drop it locally either way
  await store
    .dispatch(authApi.endpoints.logout.initiate())
    .unwrap()
    .catch(() => null);

  store.dispatch(logout());
  store.dispatch(resetAllApiState());
}

/** **************************************
 * Password reset: forgot-password mails an OTP, verifying it returns the
 * resetToken that reset-password needs.
 *************************************** */
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

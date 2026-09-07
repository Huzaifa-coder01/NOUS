/**
 * A readable message out of an RTK Query error, whatever the server sent.
 *
 * The NOUS backend answers `{ "message": "..." }` on every failure. `status` is
 * a number for an HTTP error, or FETCH_ERROR / TIMEOUT_ERROR / PARSING_ERROR
 * when the request never completed.
 */
export function handleApiError(error, fallback = 'An error occurred. Please try again.') {
  if (!error) return null;

  if (typeof error === 'string') return error;

  if (error.status === 'FETCH_ERROR') {
    return 'Cannot reach the NOUS API. Is the backend running?';
  }

  if (error.status === 'TIMEOUT_ERROR') return 'The server took too long to respond.';

  if (error.status === 'PARSING_ERROR') return 'The server sent a response we could not read.';

  const body = error.data;

  if (typeof body === 'string' && body.trim()) return body.trim();

  const inner = body?.error && typeof body.error === 'object' ? body.error : {};

  const message =
    body?.message ||
    inner.message ||
    (typeof body?.error === 'string' ? body.error : null) ||
    // validation failures usually arrive as a list
    (Array.isArray(body?.errors) && (body.errors[0]?.message || body.errors[0])) ||
    null;

  if (message) return String(message);

  if (error.status === 401) return 'Unauthorized. Please sign in again.';
  if (error.status === 403) return 'You do not have access to this.';
  if (error.status === 404) return 'Resource not found.';

  return fallback;
}

/** Same message, as something you can throw from a plain async function. */
export class ApiError extends Error {
  constructor(error, fallback) {
    super(handleApiError(error, fallback));
    this.name = 'ApiError';
    this.status = error?.status ?? 0;
    this.data = error?.data ?? null;
  }
}

import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

const env = import.meta.env;

export const CONFIG = {
  site: {
    name: 'NOUS',
    description: 'Organized learning platform for CA & ACCA',
    basePath: env.VITE_BASE_PATH ?? '',
    version: packageJson.version,
  },

  /**
   * NOUS backend. Everything here mirrors the Postman collection
   * (`postman_collection/NOUS.postman_collection.json`) - see `.env.example`.
   */
  api: {
    // VITE_BASE_URL is the name the other admin panels use; the longer one is
    // kept as a fallback so an existing .env keeps working
    baseUrl: (env.VITE_BASE_URL ?? env.VITE_API_BASE_URL ?? 'http://localhost:4019/api/v1').replace(
      /\/+$/,
      ''
    ),
    timeout: (Number(env.VITE_API_TIMEOUT) || 30) * 1000,
    /**
     * `x-admin-access-token`, required by POST /auth/login for an admin. Vite
     * inlines this into the bundle, so it gates the admin UI rather than
     * keeping anything secret.
     */
    adminAccessToken: env.VITE_ADMIN_ACCESS_TOKEN ?? '',
    /** `x-admin-access-token-signup`, for POST /auth/internal/admin/create. */
    adminSignupToken: env.VITE_ADMIN_SIGNUP_TOKEN ?? '',
    deviceType: env.VITE_DEVICE_TYPE ?? 'web',
    /** Which POST /upload/* handler to use. */
    uploadDriver: env.VITE_UPLOAD_DRIVER ?? 'cloudinary',
    /**
     * Where a stored file key resolves to.
     *
     * The upload API answers with a relative key (`nous/dev/<uuid>.png`) and
     * records keep only that, so the browser needs the delivery prefix to show
     * an avatar or open a PDF. The API cannot serve these keys itself - the
     * slashes in them do not match its `/upload/:name` route.
     */
    mediaBaseUrl: (env.VITE_MEDIA_BASE_URL ?? '').replace(/\/+$/, ''),
  },

  auth: {
    /** Where a signed-in user lands after sign in / sign up. */
    redirectPath: paths.nous.root,
    /** Where an admin lands after sign in. */
    adminRedirectPath: paths.admin.root,
  },

  /** Branding shown on the student site. The backend has no endpoint for it. */
  branding: {
    logoPrefix: 'Study',
    logoSuffix: 'Hub',
    headerNote: 'CA & ACCA',
    homeTitle: 'Welcome to StudyHub',
    homeSubtitle: 'Your organized learning platform for CA & ACCA',
    footerText: `StudyHub © ${new Date().getFullYear()}`,
  },
};

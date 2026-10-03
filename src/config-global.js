import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

const env = import.meta.env;

export const CONFIG = {
  site: {
    name: 'NOUS',
    description: 'Organized learning platform for CA & ACCA',
    basePath: env.VITE_BASE_PATH ?? '',
    version: packageJson.version,
  },

  api: {
    baseUrl: (env.VITE_BASE_URL ?? env.VITE_API_BASE_URL ?? 'http://localhost:4019/api/v1').replace(
      /\/+$/,
      ''
    ),
    timeout: (Number(env.VITE_API_TIMEOUT) || 30) * 1000,
    adminAccessToken: env.VITE_ADMIN_ACCESS_TOKEN ?? '',
    adminSignupToken: env.VITE_ADMIN_SIGNUP_TOKEN ?? '',
    deviceType: env.VITE_DEVICE_TYPE ?? 'web',
    uploadDriver: env.VITE_UPLOAD_DRIVER ?? 'cloudinary',
    mediaBaseUrl: (env.VITE_MEDIA_BASE_URL ?? '').replace(/\/+$/, ''),
  },

  auth: {
    redirectPath: paths.nous.root,
    adminRedirectPath: paths.admin.root,
  },

  branding: {
    logoPrefix: 'Study',
    logoSuffix: 'Hub',
    headerNote: 'CA & ACCA',
    homeTitle: 'Welcome to StudyHub',
    homeSubtitle: 'Your organized learning platform for CA & ACCA',
    footerText: `StudyHub © ${new Date().getFullYear()}`,
  },
};

/**
 * Every route the NOUS backend exposes, in one place.
 *
 * Taken from `postman_collection/NOUS.postman_collection.json`. Paths are
 * relative to VITE_BASE_URL, which already carries the `/api/v1` prefix.
 */
export const API_ROUTES = {
  AUTH: {
    REGISTER: 'auth/register',
    LOGIN: 'auth/login',
    ME: 'auth/me',
    LOGOUT: 'auth/logout',
    RESEND_OTP_EMAIL: 'auth/resend-otp/email',
    VERIFY_OTP_EMAIL: 'auth/verify-otp/email',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: 'auth/reset-password',
    CHANGE_PASSWORD: 'auth/change-password',
    CHECK_EMAIL_EXISTS: 'auth/check-email-exists',
    DELETE_ACCOUNT: 'auth/delete-account',
    CREATE_ADMIN: 'auth/internal/admin/create',
  },

  COURSES: {
    ALL: 'courses',
    CREATE: 'courses',
    DETAILS: (id) => `courses/${id}`,
    UPDATE: (id) => `courses/${id}`,
    DELETE: (id) => `courses/${id}`,
  },

  LEVELS: {
    ALL: 'levels',
    CREATE: 'levels',
    DETAILS: (id) => `levels/${id}`,
    UPDATE: (id) => `levels/${id}`,
    DELETE: (id) => `levels/${id}`,
  },

  SUBJECTS: {
    ALL: 'subjects',
    CREATE: 'subjects',
    DETAILS: (id) => `subjects/${id}`,
    UPDATE: (id) => `subjects/${id}`,
    DELETE: (id) => `subjects/${id}`,
  },

  CHAPTERS: {
    ALL: 'chapters',
    CREATE: 'chapters',
    DETAILS: (id) => `chapters/${id}`,
    UPDATE: (id) => `chapters/${id}`,
    DELETE: (id) => `chapters/${id}`,
  },

  PAST_PAPERS: {
    ALL: 'past-papers',
    CREATE: 'past-papers',
    DETAILS: (id) => `past-papers/${id}`,
    UPDATE: (id) => `past-papers/${id}`,
    DELETE: (id) => `past-papers/${id}`,
  },

  SYLLABUS: {
    ALL: 'syllabus',
    CREATE: 'syllabus',
    DETAILS: (id) => `syllabus/${id}`,
    UPDATE: (id) => `syllabus/${id}`,
    DELETE: (id) => `syllabus/${id}`,
  },

  NOTES: {
    ALL: 'notes',
    CREATE: 'notes',
    DETAILS: (id) => `notes/${id}`,
    UPDATE: (id) => `notes/${id}`,
    DELETE: (id) => `notes/${id}`,
  },

  UPLOADS: {
    CLOUDINARY: 'upload/cloudinary',
    AWS: 'upload/aws',
    AZURE: 'upload/azure',
    LOCAL: 'upload',
    FILE_BY_NAME: (name) => `upload/${name}`,
    FILE_DETAILS: (name) => `upload/details/${name}`,
  },

  USERS: {
    ALL: 'users',
    CREATE: 'users',
    DETAILS: (id) => `users/${id}`,
    UPDATE: (id) => `users/${id}`,
    DELETE: (id) => `users/${id}`,
    TWO_FA_SETUP: 'users/twofa/setup',
    TWO_FA_CONFIRM: 'users/twofa/confirm',
    TWO_FA_DISABLE: 'users/twofa/disable',
  },

  DASHBOARD: {
    SUMMARY: 'dashboard',
    LOG_ENGAGEMENT: 'dashboard/engagements/log',
    TRENDING: 'dashboard/engagements/trending',
    LEADS: 'dashboard/engagements/leads',
  },

  SETTINGS: {
    TERMS: 'settings/terms-conditions',
    REVIEW_TERMS: 'settings/review-terms-conditions',
    CUSTOMER_TERMS: 'settings/customer-terms-conditions',
    ABOUT_US: 'settings/about-us',
    PRIVACY_POLICY: 'settings/privacy-policy',
    FAQS: 'settings/faqs',
    CREATE: 'settings/create',
    UPDATE: (id) => `settings/update/${id}`,
  },

  HELP_CENTER: {
    ALL: 'help-center',
    CREATE: 'help-center',
    DETAILS: (id) => `help-center/${id}`,
    UPDATE: (id) => `help-center/${id}`,
    DELETE: (id) => `help-center/${id}`,
  },

  NOTIFICATIONS: {
    ALL: 'notifications',
    MARK_READ: (id) => `notifications/${id}/read`,
    PREFERENCES: 'notification-preferences',
  },

  SUPPORT: {
    SUPPORT: 'support',
    CONTACT_US: 'contact-us',
  },
};

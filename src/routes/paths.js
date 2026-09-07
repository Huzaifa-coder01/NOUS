// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  ADMIN: '/admin',
  COURSES: '/courses',
};

/** Chapter sections, as they appear in the url. */
export const SECTION_SEGMENTS = {
  syllabus: 'syllabus',
  notes: 'notes',
  pastPapers: 'past-papers',
};

// ----------------------------------------------------------------------

export const paths = {
  page404: '/404',

  // Student site
  nous: {
    root: '/',
    courses: ROOTS.COURSES,
    course: (courseId) => `${ROOTS.COURSES}/${courseId}`,
    level: (courseId, levelId) => `${ROOTS.COURSES}/${courseId}/${levelId}`,
    subject: (courseId, levelId, subjectId) =>
      `${ROOTS.COURSES}/${courseId}/${levelId}/${subjectId}`,
    // past papers straight off the subject: course + level + subject
    subjectPastPapers: (courseId, levelId, subjectId) =>
      `${ROOTS.COURSES}/${courseId}/${levelId}/${subjectId}/${SECTION_SEGMENTS.pastPapers}`,
    chapter: (courseId, levelId, subjectId, chapterId) =>
      `${ROOTS.COURSES}/${courseId}/${levelId}/${subjectId}/${chapterId}`,
    // syllabus | notes | past-papers inside a chapter
    section: (courseId, levelId, subjectId, chapterId, sectionId) =>
      `${ROOTS.COURSES}/${courseId}/${levelId}/${subjectId}/${chapterId}/${sectionId}`,
  },

  // Auth
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/sign-in`,
      signUp: `${ROOTS.AUTH}/sign-up`,
      verifyEmail: `${ROOTS.AUTH}/verify-email`,
      forgetPassword: `${ROOTS.AUTH}/forget-password`,
      verifyPassword: `${ROOTS.AUTH}/verify-password`,
      resetPassword: `${ROOTS.AUTH}/reset-password`,
    },
  },

  // Admin panel
  admin: {
    root: ROOTS.ADMIN,
    users: `${ROOTS.ADMIN}/users`,
    levels: `${ROOTS.ADMIN}/levels`,
    subjects: `${ROOTS.ADMIN}/subjects`,
    chapters: `${ROOTS.ADMIN}/chapters`,
    pastPapers: `${ROOTS.ADMIN}/past-papers`,
    syllabus: `${ROOTS.ADMIN}/syllabus`,
    notes: `${ROOTS.ADMIN}/notes`,
    profile: `${ROOTS.ADMIN}/profile`,
    settings: `${ROOTS.ADMIN}/settings`,
    catalog: {
      root: `${ROOTS.ADMIN}/catalog`,
      course: (courseId) => `${ROOTS.ADMIN}/catalog/${courseId}`,
      level: (courseId, levelId) => `${ROOTS.ADMIN}/catalog/${courseId}/${levelId}`,
      subject: (courseId, levelId, subjectId) =>
        `${ROOTS.ADMIN}/catalog/${courseId}/${levelId}/${subjectId}`,
      subjectPastPapers: (courseId, levelId, subjectId) =>
        `${ROOTS.ADMIN}/catalog/${courseId}/${levelId}/${subjectId}/${SECTION_SEGMENTS.pastPapers}`,
      chapter: (courseId, levelId, subjectId, chapterId) =>
        `${ROOTS.ADMIN}/catalog/${courseId}/${levelId}/${subjectId}/${chapterId}`,
      chapterSection: (courseId, levelId, subjectId, chapterId, sectionId) =>
        `${ROOTS.ADMIN}/catalog/${courseId}/${levelId}/${subjectId}/${chapterId}/${sectionId}`,
    },
  },
};

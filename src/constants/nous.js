// ----------------------------------------------------------------------
// Shapes and vocabulary the NOUS API uses, mirrored for the UI.
//
// Hierarchy: course > level > subject > chapter. Past papers hang off a
// subject and optionally a chapter; syllabus and notes always off a chapter.
// ----------------------------------------------------------------------

/** Mongo ids come back as `_id`. */
export function idOf(row) {
  return row?._id ?? row?.id ?? null;
}

// ----------------------------------------------------------------------
// Status
// ----------------------------------------------------------------------

/** `deleted` is only ever set by the DELETE endpoints. */
export const STATUS = { active: 'active', inactive: 'inactive', deleted: 'deleted' };

/** What an update may set. */
export const STATUS_OPTIONS = [
  { value: STATUS.active, label: 'Active' },
  { value: STATUS.inactive, label: 'Inactive' },
];

/** What a list may be filtered by, admin side. */
export const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: STATUS.active, label: 'Active' },
  { value: STATUS.inactive, label: 'Inactive' },
  { value: STATUS.deleted, label: 'Deleted' },
];

export function isActive(row) {
  return row?.status === STATUS.active;
}

/**
 * Accounts use their own vocabulary - the users list answers with a
 * `usersCount` of { pending, active, rejected, suspended } rather than the
 * active / inactive / deleted the catalog uses.
 */
export const USER_STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

// ----------------------------------------------------------------------
// Node types
// ----------------------------------------------------------------------

export const NODE_TYPES = ['course', 'level', 'subject', 'chapter'];

export const NODE_LABEL = {
  course: 'Course',
  level: 'Level',
  subject: 'Subject',
  chapter: 'Chapter',
};

// ----------------------------------------------------------------------
// Documents
// ----------------------------------------------------------------------

export const DOC_LABELS = {
  'past-paper': { singular: 'Past paper', plural: 'Past papers' },
  syllabus: { singular: 'Syllabus', plural: 'Syllabus' },
  note: { singular: 'Note', plural: 'Notes' },
};

/**
 * The three sections every chapter offers. `id` is the url segment on both the
 * student site and the admin panel; `count` names the field the chapters API
 * returns in each row's `contentCount`.
 */
export const CHAPTER_SECTIONS = [
  {
    id: 'syllabus',
    kind: 'syllabus',
    name: 'Syllabus',
    icon: '\u{1F4CB}',
    count: 'activeSyllabus',
    description: 'Syllabus PDFs for this chapter',
  },
  {
    id: 'notes',
    kind: 'note',
    name: 'Notes',
    icon: '\u{1F4DD}',
    count: 'activeNotes',
    description: 'Notes shared by students',
  },
  {
    id: 'past-papers',
    kind: 'past-paper',
    name: 'Past Papers',
    icon: '\u{1F4C4}',
    count: 'activePastPapers',
    description: 'Past paper PDFs for this chapter',
  },
];

export function sectionByRouteId(routeId) {
  return CHAPTER_SECTIONS.find((section) => section.id === routeId);
}

// ----------------------------------------------------------------------
// Emoji pickers - courses, levels and subjects each carry an `emoji`
// ----------------------------------------------------------------------

export const COURSE_EMOJIS = ['\u{1F4DA}', '\u{1F393}', '\u{1F4D6}', '\u{1F4D8}', '\u{1F3DB}\u{FE0F}', '\u{1F9FE}', '\u{1F4BC}'];

export const LEVEL_EMOJIS = ['\u{1F4D6}'];

export const SUBJECT_EMOJIS = ['\u{1F4D8}'];

// ----------------------------------------------------------------------

/** Reads a `contentCount` field off a row without assuming it is present. */
export function contentCount(row, field) {
  return Number(row?.contentCount?.[field] ?? 0);
}

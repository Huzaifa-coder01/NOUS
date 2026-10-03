export function idOf(row) {
  return row?._id ?? row?.id ?? null;
}

export const STATUS = { active: 'active', inactive: 'inactive', deleted: 'deleted' };

export const STATUS_OPTIONS = [
  { value: STATUS.active, label: 'Active' },
  { value: STATUS.inactive, label: 'Inactive' },
];

export const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: STATUS.active, label: 'Active' },
  { value: STATUS.inactive, label: 'Inactive' },
  { value: STATUS.deleted, label: 'Deleted' },
];

export function isActive(row) {
  return row?.status === STATUS.active;
}

export const USER_STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

export const NODE_TYPES = ['course', 'level', 'subject', 'chapter'];

export const NODE_LABEL = {
  course: 'Course',
  level: 'Level',
  subject: 'Subject',
  chapter: 'Chapter',
};

export const DOC_LABELS = {
  'past-paper': { singular: 'Past paper', plural: 'Past papers' },
  syllabus: { singular: 'Syllabus', plural: 'Syllabus' },
  note: { singular: 'Note', plural: 'Notes' },
};

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

export const COURSE_EMOJIS = ['\u{1F4DA}', '\u{1F393}', '\u{1F4D6}', '\u{1F4D8}', '\u{1F3DB}\u{FE0F}', '\u{1F9FE}', '\u{1F4BC}'];

export const LEVEL_EMOJIS = ['\u{1F4D6}'];

export const SUBJECT_EMOJIS = ['\u{1F4D8}'];

export function contentCount(row, field) {
  return Number(row?.contentCount?.[field] ?? 0);
}

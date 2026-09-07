import { paths } from 'src/routes/paths';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  analytics: icon('ic-analytics'),
  course: icon('ic-course'),
  level: icon('ic-dashboard-2'),
  subject: icon('ic-blog'),
  chapter: icon('ic-menu-item'),
  folder: icon('ic-folder'),
  file: icon('ic-file'),
  page: icon('ic-blank'),
  user: icon('ic-user'),
  profile: icon('ic-user'),
  parameter: icon('ic-parameter'),
  external: icon('ic-external'),
};

// ----------------------------------------------------------------------

/**
 * NOUS admin navigation.
 *
 * Catalog holds one entry per level of the hierarchy: Courses is the drill-down
 * starting point, and Levels / Subjects / Chapters are flat lists of everything
 * of that kind, wherever it sits.
 */
export const navData = [
  {
    subheader: 'Overview',
    items: [{ title: 'Analytics', path: paths.admin.root, icon: ICONS.analytics }],
  },
  {
    subheader: 'Catalog',
    items: [
      { title: 'Courses', path: paths.admin.catalog.root, icon: ICONS.course },
      { title: 'Levels', path: paths.admin.levels, icon: ICONS.level },
      { title: 'Subjects', path: paths.admin.subjects, icon: ICONS.subject },
      { title: 'Chapters', path: paths.admin.chapters, icon: ICONS.chapter },
    ],
  },
  {
    subheader: 'Documents',
    items: [
      { title: 'Past papers', path: paths.admin.pastPapers, icon: ICONS.file },
      { title: 'Syllabus', path: paths.admin.syllabus, icon: ICONS.page },
      { title: 'Student notes', path: paths.admin.notes, icon: ICONS.folder },
    ],
  },
  {
    subheader: 'Account',
    items: [
      { title: 'Users', path: paths.admin.users, icon: ICONS.user },
      { title: 'Profile', path: paths.admin.profile, icon: ICONS.profile },
      { title: 'View site', path: paths.nous.root, icon: ICONS.external },
    ],
  },
];

import { useMemo } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { idOf, STATUS } from 'src/constants/nous';
import {
  handleApiError,
  useGetUsersQuery,
  useGetNotesQuery,
  useGetLevelsQuery,
  useGetCoursesQuery,
  useGetSubjectsQuery,
  useGetChaptersQuery,
  useGetSyllabusListQuery,
  useGetPastPapersQuery,
} from 'src/store';

import { DashboardContent } from 'src/layouts/dashboard';

import { useAuthContext } from 'src/auth/hooks';

import { AnalyticsStatTile } from '../analytics-stat-tile';
import { AnalyticsLinkList } from '../analytics-link-list';
import { AnalyticsVisibility } from '../analytics-visibility';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';

// ----------------------------------------------------------------------

/**
 * Every list endpoint returns a `meta.<x>Count` with totalRecord / active /
 * inactive / deleted, so a page-of-one query per resource is enough to build
 * the whole dashboard - no client-side aggregation of the catalog.
 *
 * `GET /dashboard` also exists but its response shape is not documented in the
 * collection, so nothing here depends on it.
 */
const HEAD = { page: 1, limit: 1 };

const EMPTY = { total: 0, active: 0, inactive: 0, deleted: 0 };

function sum(...groups) {
  return groups.reduce(
    (acc, group) => ({
      total: acc.total + (group?.total ?? 0),
      active: acc.active + (group?.active ?? 0),
      inactive: acc.inactive + (group?.inactive ?? 0),
      deleted: acc.deleted + (group?.deleted ?? 0),
    }),
    EMPTY
  );
}

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const theme = useTheme();

  const { user } = useAuthContext();

  const courseHead = useGetCoursesQuery(HEAD);
  const levelHead = useGetLevelsQuery(HEAD);
  const subjectHead = useGetSubjectsQuery(HEAD);
  const chapterHead = useGetChaptersQuery(HEAD);
  const paperHead = useGetPastPapersQuery(HEAD);
  const syllabusHead = useGetSyllabusListQuery(HEAD);
  const noteHead = useGetNotesQuery(HEAD);

  const users = useGetUsersQuery({ page: 1, limit: 5, userType: 'student' });

  /** The newest student uploads - the one thing students can add. */
  const recentNotes = useGetNotesQuery({ page: 1, limit: 6 });

  /** Chapters with nothing published yet, straight from `contentCount`. */
  const emptyChapters = useGetChaptersQuery({ page: 1, limit: 100, status: STATUS.active });

  const firstError =
    courseHead.error ?? levelHead.error ?? subjectHead.error ?? chapterHead.error ?? null;

  const data = useMemo(
    () => ({
      courses: courseHead.data?.counts,
      levels: levelHead.data?.counts,
      subjects: subjectHead.data?.counts,
      chapters: chapterHead.data?.counts,
      papers: paperHead.data?.counts,
      syllabus: syllabusHead.data?.counts,
      notes: noteHead.data?.counts,
    }),
    [
      courseHead.data,
      levelHead.data,
      subjectHead.data,
      chapterHead.data,
      paperHead.data,
      syllabusHead.data,
      noteHead.data,
    ]
  );

  const pdfs = useMemo(() => sum(data?.papers, data?.syllabus, data?.notes), [data]);

  const visibility = useMemo(
    () => [
      {
        label: 'Visible to students',
        color: 'success',
        hint: 'Active, and reachable through an active course, level, subject and chapter',
        value: pdfs.active,
      },
      {
        label: 'Switched off',
        color: 'warning',
        hint: 'Set to inactive, on its own or by a cascade',
        value: pdfs.inactive,
      },
      {
        label: 'Deleted',
        color: 'error',
        hint: 'Soft deleted - kept in the database, never shown',
        value: pdfs.deleted,
      },
    ],
    [pdfs]
  );

  const byKind = useMemo(
    () => ({
      categories: ['Past papers', 'Syllabus', 'Student notes'],
      colors: [theme.palette.success.dark, theme.palette.warning.main, theme.palette.error.main],
      series: [
        {
          name: 'Active',
          data: [data?.papers?.active ?? 0, data?.syllabus?.active ?? 0, data?.notes?.active ?? 0],
        },
        {
          name: 'Inactive',
          data: [
            data?.papers?.inactive ?? 0,
            data?.syllabus?.inactive ?? 0,
            data?.notes?.inactive ?? 0,
          ],
        },
        {
          name: 'Deleted',
          data: [
            data?.papers?.deleted ?? 0,
            data?.syllabus?.deleted ?? 0,
            data?.notes?.deleted ?? 0,
          ],
        },
      ],
      options: {
        plotOptions: { bar: { columnWidth: '48%', borderRadius: 4 } },
        tooltip: { y: { formatter: (value) => `${value} PDFs` } },
      },
    }),
    [data, theme]
  );

  const attention = useMemo(() => {
    const rows = emptyChapters.data?.rows ?? [];

    const gaps = rows.filter(
      (chapter) =>
        !chapter.contentCount ||
        (chapter.contentCount.activeSyllabus ?? 0) +
          (chapter.contentCount.activeNotes ?? 0) +
          (chapter.contentCount.activePastPapers ?? 0) ===
          0
    );

    return {
      count: gaps.length,
      items: gaps.slice(0, 6).map((chapter) => {
        const subject = chapter.subject ?? chapter.subjectId;
        const level = subject?.level ?? subject?.levelId;
        const course = level?.course ?? level?.courseId;

        const href =
          course && level && subject
            ? paths.admin.catalog.chapter(idOf(course), idOf(level), idOf(subject), idOf(chapter))
            : paths.admin.chapters;

        return {
          id: idOf(chapter),
          icon: 'solar:folder-open-bold',
          color: 'info',
          primary: `Chapter ${chapter.chapterNumber} - ${chapter.name}`,
          secondary: [course?.name, level?.name, subject?.name]
            .filter(Boolean)
            .concat('nothing to read yet')
            .join(' · '),
          href,
        };
      }),
    };
  }, [emptyChapters.data]);

  const noteItems = useMemo(
    () =>
      (recentNotes.data?.rows ?? []).map((note) => ({
        id: idOf(note),
        icon: 'solar:document-text-bold',
        color: note.status === STATUS.active ? 'success' : 'warning',
        badge: note.status === STATUS.active ? undefined : note.status,
        primary: note.name,
        secondary: [
          note.uploadedBy?.name ?? 'A student',
          note.createdAt ? fDate(note.createdAt) : null,
        ]
          .filter(Boolean)
          .join(' · '),
        href: paths.admin.notes,
      })),
    [recentNotes.data]
  );

  const recentUsers = useMemo(
    () =>
      (users.data?.rows ?? []).map((item, index) => ({
        id: idOf(item),
        title: `${item.name} · ${item.userType === 'admin' ? 'Admin' : 'Student'}`,
        type: `order${index + 1}`,
        time: item.createdAt,
      })),
    [users.data]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 1 }}>
        Hi, {user?.name?.split(' ')[0] ?? 'admin'} 👋
      </Typography>

      <Typography sx={{ mb: { xs: 3, md: 5 }, color: 'text.secondary' }}>
        {firstError
          ? `Could not reach the API: ${handleApiError(firstError)}`
          : 'What students can reach right now, and what still needs your attention.'}
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsStatTile
            title="Courses"
            active={data?.courses?.active ?? 0}
            total={data?.courses?.total ?? 0}
            icon={<img alt="" src="/assets/icons/glass/ic-glass-bag.svg" />}
            hint="Only active courses appear on the student site"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsStatTile
            title="Subjects"
            color="secondary"
            active={data?.subjects?.active ?? 0}
            total={data?.subjects?.total ?? 0}
            icon={<img alt="" src="/assets/icons/glass/ic-glass-users.svg" />}
            hint="Counted across every course and level"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsStatTile
            title="Chapters"
            color="warning"
            active={data?.chapters?.active ?? 0}
            total={data?.chapters?.total ?? 0}
            icon={<img alt="" src="/assets/icons/glass/ic-glass-buy.svg" />}
            hint="Counted across every subject"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsStatTile
            title="PDFs"
            color="error"
            active={pdfs.active}
            total={pdfs.total}
            icon={<img alt="" src="/assets/icons/glass/ic-glass-message.svg" />}
            hint="Past papers, syllabus and student notes together"
          />
        </Grid>

        <Grid xs={12} md={5} lg={4}>
          <AnalyticsVisibility
            title="PDF visibility"
            subheader="Why a document does or does not reach students"
            segments={visibility}
          />
        </Grid>

        <Grid xs={12} md={7} lg={8}>
          <AnalyticsWebsiteVisits
            title="Library by type"
            subheader="Every PDF in the catalog, by status"
            chart={byKind}
          />
        </Grid>

        <Grid xs={12} lg={8}>
          <AnalyticsLinkList
            title="Needs attention"
            subheader={
              attention.count
                ? `${attention.count} active chapters have nothing to read yet`
                : 'Gaps a student would notice'
            }
            list={attention.items}
            emptyText="Nothing to fix - every active chapter has content."
          />
        </Grid>

        <Grid xs={12} lg={4}>
          <AnalyticsOrderTimeline title="Newest students" list={recentUsers} />
        </Grid>

        <Grid xs={12}>
          <AnalyticsLinkList
            title="Latest student notes"
            subheader="The only thing students can add"
            list={noteItems}
            minHeight={0}
            emptyText="No student has uploaded notes yet."
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

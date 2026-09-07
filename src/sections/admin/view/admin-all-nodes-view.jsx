import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { nodeHooks } from 'src/store';
import { useListQuery } from 'src/hooks/use-list-query';
import { useInvalidateCatalog } from 'src/hooks/use-invalidate-catalog';
import { idOf, contentCount, CHAPTER_SECTIONS } from 'src/constants/nous';

import { Label } from 'src/components/label';

import { EntityList } from '../components/entity-list';

// ----------------------------------------------------------------------

/** A parent relation comes back populated on these list rows. */
function relation(value) {
  return value && typeof value === 'object' ? value : null;
}

/** Walks whatever part of the chain a row carries. */
function chainOf(row) {
  const subject = relation(row.subject ?? row.subjectId);
  const level = relation(row.level ?? row.levelId) ?? relation(subject?.level ?? subject?.levelId);
  const course = relation(row.course ?? row.courseId) ?? relation(level?.course ?? level?.courseId);

  return { course, level, subject };
}

const emojiName = (label) => ({
  id: 'name',
  label,
  render: (row) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {!!row.emoji && (
        <Box component="span" sx={{ fontSize: 20 }}>
          {row.emoji}
        </Box>
      )}
      <Typography variant="subtitle2">{row.name}</Typography>
    </Box>
  ),
});

function locationColumn(label, lines) {
  return {
    id: 'location',
    label,
    render: (row) => {
      const [primary, secondary] = lines(chainOf(row));

      return (
        <>
          <Typography variant="body2">{primary || '—'}</Typography>
          {!!secondary && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {secondary}
            </Typography>
          )}
        </>
      );
    },
  };
}

const countsColumn = (label, width, fields) => ({
  id: 'contentCount',
  label,
  width,
  render: (row) => (
    <Label color="info">{fields.map((field) => contentCount(row, field)).join(' · ')}</Label>
  ),
});

// ----------------------------------------------------------------------

const CONFIG = {
  level: {
    heading: 'Levels',
    editLabel: 'Edit level',
    searchPlaceholder: 'Search levels...',
    fields: [{ name: 'name', label: 'Level name', required: true }],
    columns: [
      emojiName('Level'),
      locationColumn('Course', ({ course }) => [course?.name]),
      countsColumn('Subjects · Chapters', 190, ['activeSubjects', 'activeChapters']),
    ],
    toValues: (row) => ({ name: row.name }),
    open: (row) => {
      const { course } = chainOf(row);

      return course ? paths.admin.catalog.level(idOf(course), idOf(row)) : null;
    },
    openLabel: 'Subjects',
    deleteNote:
      'A soft delete: the level is marked deleted and its subjects, chapters and PDFs are switched to inactive.',
  },

  subject: {
    heading: 'Subjects',
    editLabel: 'Edit subject',
    subheading:
      'Every subject in the system, whichever course and level it belongs to. Add new subjects from the level they sit under.',
    searchPlaceholder: 'Search subjects...',
    fields: [{ name: 'name', label: 'Subject name', required: true }],
    columns: [
      emojiName('Subject'),
      locationColumn('Course / level', ({ course, level }) => [course?.name, level?.name]),
      countsColumn('Chapters · Papers', 190, ['activeChapters', 'activePastPapers']),
    ],
    toValues: (row) => ({ name: row.name }),
    open: (row) => {
      const { course, level } = chainOf(row);

      return course && level
        ? paths.admin.catalog.subject(idOf(course), idOf(level), idOf(row))
        : null;
    },
    openLabel: 'Chapters',
    deleteNote:
      'A soft delete: the subject is marked deleted and its chapters and PDFs are switched to inactive.',
  },

  chapter: {
    heading: 'Chapters',
    editLabel: 'Edit chapter',
    subheading:
      'Every chapter in the system, whichever subject it belongs to. Add new chapters from the subject they sit under.',
    searchPlaceholder: 'Search chapters...',
    fields: [
      { name: 'chapterNumber', label: 'Chapter number', type: 'number', required: true },
      { name: 'name', label: 'Chapter name', required: true },
    ],
    columns: [
      {
        id: 'chapterNumber',
        label: 'Chapter',
        render: (row) => (
          <>
            <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
              Chapter {row.chapterNumber}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {row.name}
            </Typography>
          </>
        ),
      },
      locationColumn('Course / level / subject', ({ course, level, subject }) => [
        [course?.name, level?.name].filter(Boolean).join(' · '),
        subject?.name,
      ]),
      {
        id: 'contentCount',
        label: 'Syllabus · Notes · Papers',
        width: 220,
        render: (row) => (
          <Stack direction="row" spacing={0.75}>
            {CHAPTER_SECTIONS.map((section) => {
              const count = contentCount(row, section.count);

              return (
                <Label key={section.id} title={section.name} color={count ? 'success' : 'default'}>
                  {section.icon} {count}
                </Label>
              );
            })}
          </Stack>
        ),
      },
    ],
    toValues: (row) => ({ chapterNumber: row.chapterNumber, name: row.name }),
    describe: (row) => `Chapter ${row.chapterNumber} - ${row.name}`,
    open: (row) => {
      const { course, level, subject } = chainOf(row);

      return course && level && subject
        ? paths.admin.catalog.chapter(idOf(course), idOf(level), idOf(subject), idOf(row))
        : null;
    },
    openLabel: 'Content',
    deleteNote:
      'A soft delete: the chapter is marked deleted and its past papers, syllabus and notes are switched to inactive.',
  },
};

// ----------------------------------------------------------------------

/**
 * One node type listed across the whole catalog, with the course / level /
 * subject it belongs to. The list endpoints already page, search and filter by
 * status server side, and their rows carry the parent chain, so these screens
 * are the same call the scoped screens make minus the parent filter.
 *
 * Creating is deliberately absent: a new level, subject or chapter needs a
 * parent, so it is added from that parent's page.
 */
export function AdminAllNodesView({ type }) {
  const navigate = useNavigate();

  const config = CONFIG[type];

  const hooks = nodeHooks[type];

  const list = useListQuery(hooks.useList);

  const [update] = hooks.useUpdate();
  const [remove] = hooks.useDelete();

  const invalidateCatalog = useInvalidateCatalog();

  return (
    <EntityList
      heading={config.heading}
      links={[{ name: 'Admin', href: paths.admin.root }, { name: config.heading }]}
      list={list}
      columns={config.columns}
      searchPlaceholder={config.searchPlaceholder}
      fields={config.fields}
      editLabel={config.editLabel}
      cascades
      deleteNote={config.deleteNote}
      describe={config.describe}
      toValues={config.toValues}
      onUpdate={(row, values) =>
        update({
          id: idOf(row),
          ...values,
          ...(values.chapterNumber ? { chapterNumber: Number(values.chapterNumber) } : {}),
        }).unwrap()
      }
      onToggleStatus={async (row, status) => {
        await update({ id: idOf(row), status }).unwrap();
        invalidateCatalog();
      }}
      onDelete={async (row) => {
        await remove(idOf(row)).unwrap();
        invalidateCatalog();
      }}
      onOpen={(row) => {
        const href = config.open(row);

        if (href) navigate(href);
      }}
      openLabel={config.openLabel}
      toolbar={
        <Typography sx={{ px: 2.5, pb: 2.5, fontSize: 14, color: 'text.secondary' }}>
          {config.subheading}
        </Typography>
      }
    />
  );
}

import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useListQuery } from 'src/hooks/use-list-query';
import { useInvalidateCatalog } from 'src/hooks/use-invalidate-catalog';
import { idOf, contentCount, CHAPTER_SECTIONS } from 'src/constants/nous';
import { useGetChaptersQuery, useCreateChapterMutation, useUpdateChapterMutation, useDeleteChapterMutation } from 'src/store';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { EntityList } from '../components/entity-list';

// ----------------------------------------------------------------------

const FIELDS = [
  {
    name: 'chapterNumber',
    label: 'Chapter number',
    type: 'number',
    required: true,
  },
  { name: 'name', label: 'Chapter name', required: true },
];

const DELETE_NOTE = 'A soft delete: the chapter is marked deleted and its past papers, syllabus and notes are switched to inactive.';

// ----------------------------------------------------------------------

export function AdminSubjectView({ course, level, subject }) {
  const navigate = useNavigate();

  const courseId = idOf(course);
  const levelId = idOf(level);
  const subjectId = idOf(subject);

  const list = useListQuery(useGetChaptersQuery, { subjectId });

  const [createChapter] = useCreateChapterMutation();
  const [updateChapter] = useUpdateChapterMutation();
  const [deleteChapter] = useDeleteChapterMutation();

  const invalidateCatalog = useInvalidateCatalog();

  const columns = [
    {
      id: 'chapterNumber',
      label: 'No.',
      width: 80,
      render: (row) => (
        <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
          {row.chapterNumber}
        </Typography>
      ),
    },
    { id: 'name', label: 'Chapter' },
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
  ];

  return (
    <EntityList
      heading="Chapters"
      links={[
        { name: 'Admin', href: paths.admin.root },
        { name: 'Catalog', href: paths.admin.catalog.root },
        { name: course.name, href: paths.admin.catalog.course(courseId) },
        { name: level.name, href: paths.admin.catalog.level(courseId, levelId) },
        { name: subject.name },
      ]}
      list={list}
      columns={columns}
      searchPlaceholder="Search chapter..."
      createLabel="New chapter"
      editLabel="Edit chapter"
      fields={FIELDS}
      cascades
      deleteNote={DELETE_NOTE}
      emptyValues={{ chapterNumber: (list.total ?? 0) + 1, name: '' }}
      toValues={(row) => ({ chapterNumber: row.chapterNumber, name: row.name })}
      describe={(row) => `Chapter ${row.chapterNumber} - ${row.name}`}
      onCreate={(values) => createChapter({ ...values, subjectId }).unwrap()}
      onUpdate={(row, values) =>
        updateChapter({
          id: idOf(row),
          name: values.name,
          chapterNumber: Number(values.chapterNumber),
        }).unwrap()
      }
      onToggleStatus={async (row, status) => {
        await updateChapter({ id: idOf(row), status }).unwrap();
        invalidateCatalog();
      }}
      onDelete={async (row) => {
        await deleteChapter(idOf(row)).unwrap();
        invalidateCatalog();
      }}
      onOpen={(row) => navigate(paths.admin.catalog.chapter(courseId, levelId, subjectId, idOf(row)))}
      openLabel="Content"
      extraActions={
        <Button
          color="inherit"
          variant="outlined"
          sx={{ flexShrink: 0 }}
          startIcon={<Iconify icon="solar:documents-bold" />}
          onClick={() => navigate(paths.admin.catalog.subjectPastPapers(courseId, levelId, subjectId))}
        >
          Subject past papers
        </Button>
      }
    />
  );
}

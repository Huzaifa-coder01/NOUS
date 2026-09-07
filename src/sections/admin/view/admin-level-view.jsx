import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useListQuery } from 'src/hooks/use-list-query';
import { useInvalidateCatalog } from 'src/hooks/use-invalidate-catalog';
import { idOf, contentCount, SUBJECT_EMOJIS } from 'src/constants/nous';
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from 'src/store';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { EntityList } from '../components/entity-list';

// ----------------------------------------------------------------------

const FIELDS = [
  { name: 'name', label: 'Subject name', required: true },
  {
    name: 'emoji',
    label: 'Emoji',
    type: 'select',
    options: SUBJECT_EMOJIS.map((emoji) => ({ value: emoji, label: emoji })),
  },
];

const DELETE_NOTE =
  'A soft delete: the subject is marked deleted and its chapters and PDFs are switched to inactive.';

// ----------------------------------------------------------------------

export function AdminLevelView({ course, level }) {
  const navigate = useNavigate();

  const courseId = idOf(course);
  const levelId = idOf(level);

  const list = useListQuery(useGetSubjectsQuery, { courseId, levelId });

  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const invalidateCatalog = useInvalidateCatalog();

  const columns = [
    {
      id: 'name',
      label: 'Subject',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box component="span" sx={{ fontSize: 20 }}>
            {row.emoji}
          </Box>
          <Typography variant="subtitle2">{row.name}</Typography>
        </Box>
      ),
    },
    {
      id: 'contentCount',
      label: 'Chapters',
      width: 120,
      render: (row) => <Label color="info">{contentCount(row, 'activeChapters')}</Label>,
    },
    {
      id: 'pastPapers',
      label: 'Past papers',
      width: 200,
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Label color={contentCount(row, 'activePastPapers') ? 'success' : 'default'}>
            {contentCount(row, 'activePastPapers')}
          </Label>

          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="solar:document-text-bold" />}
            onClick={() =>
              navigate(paths.admin.catalog.subjectPastPapers(courseId, levelId, idOf(row)))
            }
          >
            Manage
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <EntityList
      heading="Subjects"
      links={[
        { name: 'Admin', href: paths.admin.root },
        { name: 'Catalog', href: paths.admin.catalog.root },
        { name: course.name, href: paths.admin.catalog.course(courseId) },
        { name: level.name },
      ]}
      list={list}
      columns={columns}
      searchPlaceholder="Search subject..."
      createLabel="New subject"
      editLabel="Edit subject"
      fields={FIELDS}
      cascades
      deleteNote={DELETE_NOTE}
      emptyValues={{ name: '', emoji: SUBJECT_EMOJIS[0] }}
      toValues={(row) => ({ name: row.name, emoji: row.emoji })}
      onCreate={(values) => createSubject({ ...values, levelId }).unwrap()}
      onUpdate={(row, values) => updateSubject({ id: idOf(row), ...values }).unwrap()}
      onToggleStatus={async (row, status) => {
        await updateSubject({ id: idOf(row), status }).unwrap();
        invalidateCatalog();
      }}
      onDelete={async (row) => {
        await deleteSubject(idOf(row)).unwrap();
        invalidateCatalog();
      }}
      onOpen={(row) => navigate(paths.admin.catalog.subject(courseId, levelId, idOf(row)))}
      openLabel="Chapters"
    />
  );
}

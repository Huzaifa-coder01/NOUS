import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useListQuery } from 'src/hooks/use-list-query';
import { useInvalidateCatalog } from 'src/hooks/use-invalidate-catalog';
import { idOf, contentCount, COURSE_EMOJIS } from 'src/constants/nous';
import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from 'src/store';

import { Label } from 'src/components/label';

import { EntityList } from '../components/entity-list';

// ----------------------------------------------------------------------

const FIELDS = [
  { name: 'name', label: 'Course name', required: true, helperText: 'Unique among courses' },
  {
    name: 'emoji',
    label: 'Emoji',
    type: 'select',
    options: COURSE_EMOJIS.map((emoji) => ({ value: emoji, label: emoji })),
  },
  { name: 'description', label: 'Description', type: 'multiline', minRows: 3 },
];

const COLUMNS = [
  {
    id: 'name',
    label: 'Course',
    render: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box component="span" sx={{ fontSize: 22 }}>
          {row.emoji}
        </Box>
        <Typography variant="subtitle2">{row.name}</Typography>
      </Box>
    ),
  },
  {
    id: 'description',
    label: 'Description',
    render: (row) => (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {row.description}
      </Typography>
    ),
  },
  {
    id: 'contentCount',
    label: 'Levels · Subjects',
    width: 170,
    render: (row) => (
      <Label color="info">
        {contentCount(row, 'activeLevels')} · {contentCount(row, 'activeSubjects')}
      </Label>
    ),
  },
];

const DELETE_NOTE =
  'A delete is a soft delete: the course is marked deleted and everything under it is switched to inactive, never removed.';

// ----------------------------------------------------------------------

export function AdminCatalogView() {
  const navigate = useNavigate();

  const list = useListQuery(useGetCoursesQuery);

  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const invalidateCatalog = useInvalidateCatalog();

  return (
    <EntityList
      heading="Courses"
      links={[{ name: 'Admin', href: paths.admin.root }, { name: 'Catalog' }]}
      list={list}
      columns={COLUMNS}
      searchPlaceholder="Search course..."
      createLabel="New course"
      editLabel="Edit course"
      fields={FIELDS}
      cascades
      deleteNote={DELETE_NOTE}
      emptyValues={{ name: '', emoji: COURSE_EMOJIS[0], description: '' }}
      toValues={(row) => ({
        name: row.name,
        emoji: row.emoji,
        description: row.description ?? '',
      })}
      onCreate={(values) => createCourse(values).unwrap()}
      onUpdate={(row, values) => updateCourse({ id: idOf(row), ...values }).unwrap()}
      onToggleStatus={async (row, status) => {
        await updateCourse({ id: idOf(row), status }).unwrap();
        invalidateCatalog();
      }}
      onDelete={async (row) => {
        await deleteCourse(idOf(row)).unwrap();
        invalidateCatalog();
      }}
      onOpen={(row) => navigate(paths.admin.catalog.course(idOf(row)))}
      openLabel="Levels"
    />
  );
}

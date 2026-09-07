import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useListQuery } from 'src/hooks/use-list-query';
import { useInvalidateCatalog } from 'src/hooks/use-invalidate-catalog';
import { idOf, contentCount, LEVEL_EMOJIS } from 'src/constants/nous';
import {
  useGetLevelsQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
} from 'src/store';

import { Label } from 'src/components/label';

import { EntityList } from '../components/entity-list';

// ----------------------------------------------------------------------

const FIELDS = [
  { name: 'name', label: 'Level name', required: true },
  {
    name: 'emoji',
    label: 'Emoji',
    type: 'select',
    options: LEVEL_EMOJIS.map((emoji) => ({ value: emoji, label: emoji })),
  },
];

const COLUMNS = [
  {
    id: 'name',
    label: 'Level',
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
    label: 'Subjects · Chapters',
    width: 190,
    render: (row) => (
      <Label color="info">
        {contentCount(row, 'activeSubjects')} · {contentCount(row, 'activeChapters')}
      </Label>
    ),
  },
];

const DELETE_NOTE =
  'A soft delete: the level is marked deleted and its subjects, chapters and PDFs are switched to inactive.';

// ----------------------------------------------------------------------

export function AdminCourseView({ course }) {
  const navigate = useNavigate();

  const courseId = idOf(course);

  const list = useListQuery(useGetLevelsQuery, { courseId });

  const [createLevel] = useCreateLevelMutation();
  const [updateLevel] = useUpdateLevelMutation();
  const [deleteLevel] = useDeleteLevelMutation();

  const invalidateCatalog = useInvalidateCatalog();

  return (
    <EntityList
      heading="Levels"
      links={[
        { name: 'Admin', href: paths.admin.root },
        { name: 'Catalog', href: paths.admin.catalog.root },
        { name: course.name },
      ]}
      list={list}
      columns={COLUMNS}
      searchPlaceholder="Search level..."
      createLabel="New level"
      editLabel="Edit level"
      fields={FIELDS}
      cascades
      deleteNote={DELETE_NOTE}
      emptyValues={{ name: '', emoji: LEVEL_EMOJIS[0] }}
      toValues={(row) => ({ name: row.name, emoji: row.emoji })}
      onCreate={(values) => createLevel({ ...values, courseId }).unwrap()}
      onUpdate={(row, values) => updateLevel({ id: idOf(row), ...values }).unwrap()}
      onToggleStatus={async (row, status) => {
        await updateLevel({ id: idOf(row), status }).unwrap();
        invalidateCatalog();
      }}
      onDelete={async (row) => {
        await deleteLevel(idOf(row)).unwrap();
        invalidateCatalog();
      }}
      onOpen={(row) => navigate(paths.admin.catalog.level(courseId, idOf(row)))}
      openLabel="Subjects"
    />
  );
}

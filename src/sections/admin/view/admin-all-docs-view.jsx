import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { idOf, DOC_LABELS } from 'src/constants/nous';
import { useListQuery } from 'src/hooks/use-list-query';
import { documentHooks, useUploadFileMutation } from 'src/store';

import { EntityList } from '../components/entity-list';
import { nameColumn, fileColumn, uploadedColumn } from '../components/doc-columns';

// ----------------------------------------------------------------------

const FIELDS = [
  {
    name: 'name',
    label: 'PDF name',
    required: true,
    helperText: 'Must be unique across every PDF in the system',
  },
  {
    name: 'file',
    type: 'file',
    label: 'Replace PDF (optional)',
    helperText: 'Leave empty to keep the current file',
  },
];

/** A relation is populated on these rows, but fall back to a bare id. */
function nameOf(value) {
  if (!value) return null;

  return typeof value === 'object' ? value.name : null;
}

/** Where the document lives - the whole point of the cross-catalog modules. */
const locationColumn = {
  id: 'course',
  label: 'Course / level / subject / chapter',
  render: (row) => {
    const course = nameOf(row.course ?? row.courseId);
    const level = nameOf(row.level ?? row.levelId);
    const subject = nameOf(row.subject ?? row.subjectId);
    const chapter = row.chapter ?? row.chapterId;

    const chapterLabel =
      chapter && typeof chapter === 'object'
        ? `Chapter ${chapter.chapterNumber ?? ''} ${chapter.name ?? ''}`.trim()
        : null;

    return (
      <>
        <Typography variant="body2">
          {[course, level].filter(Boolean).join(' · ') || '—'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {[subject, chapterLabel ?? 'whole subject'].filter(Boolean).join(' · ')}
        </Typography>
      </>
    );
  },
};

// ----------------------------------------------------------------------

/**
 * Every document of one kind, wherever it sits, with the hierarchy it belongs
 * to. This is the notes management module the brief asks for - students upload
 * from the chapter page and everything else about a note happens here.
 *
 * Creating is left to the scoped screens, which know the parent ids.
 */
export function AdminAllDocsView({ kind, heading, subheading }) {
  const navigate = useNavigate();

  const hooks = documentHooks[kind];

  const list = useListQuery(hooks.useList);

  const [uploadFile] = useUploadFileMutation();
  const [update] = hooks.useUpdate();
  const [remove] = hooks.useDelete();

  const columns = [
    nameColumn,
    locationColumn,
    ...(kind === 'note' ? [uploadedColumn] : []),
    fileColumn,
  ];

  /** Jumps to the screen that owns the document. */
  const openOwner = (row) => {
    const courseId = idOf(row.course ?? row.courseId) ?? row.courseId;
    const levelId = idOf(row.level ?? row.levelId) ?? row.levelId;
    const subjectId = idOf(row.subject ?? row.subjectId) ?? row.subjectId;
    const chapterId = idOf(row.chapter ?? row.chapterId) ?? row.chapterId;

    if (!courseId || !levelId || !subjectId) return;

    if (chapterId) {
      const section = { 'past-paper': 'past-papers', note: 'notes', syllabus: 'syllabus' }[kind];

      navigate(
        paths.admin.catalog.chapterSection(courseId, levelId, subjectId, chapterId, section)
      );
      return;
    }

    navigate(paths.admin.catalog.subjectPastPapers(courseId, levelId, subjectId));
  };

  return (
    <EntityList
      heading={heading}
      links={[{ name: 'Admin', href: paths.admin.root }, { name: heading }]}
      list={list}
      columns={columns}
      searchPlaceholder={`Search ${DOC_LABELS[kind].plural.toLowerCase()}...`}
      editLabel="Edit PDF"
      fields={FIELDS}
      describe={(row) => row.name}
      deleteNote="Deleting marks the PDF deleted server side; students stop seeing it straight away."
      toValues={(row) => ({ name: row.name, file: null })}
      onUpdate={async (row, values) => {
        const stored = values.file ? await uploadFile(values.file).unwrap() : null;

        return update({
          id: idOf(row),
          name: values.name,
          ...(stored ? { file: stored.file, fileUrl: stored.fileUrl } : {}),
        }).unwrap();
      }}
      onToggleStatus={(row, status) => update({ id: idOf(row), status }).unwrap()}
      onDelete={(row) => remove(idOf(row)).unwrap()}
      onOpen={openOwner}
      openLabel="Go to"
      toolbar={
        subheading && (
          <Typography sx={{ px: 2.5, pb: 2.5, fontSize: 14, color: 'text.secondary' }}>
            {subheading}
          </Typography>
        )
      }
    />
  );
}

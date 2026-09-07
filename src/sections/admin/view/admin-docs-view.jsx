import { paths } from 'src/routes/paths';

import { idOf, DOC_LABELS } from 'src/constants/nous';
import { useListQuery } from 'src/hooks/use-list-query';
import { documentHooks, useUploadFileMutation } from 'src/store';

import { EntityList } from '../components/entity-list';
import { nameColumn, fileColumn, uploadedColumn } from '../components/doc-columns';

// ----------------------------------------------------------------------

const NAME_FIELD = {
  name: 'name',
  label: 'PDF name',
  required: true,
  helperText: 'Must be unique across every PDF in the system',
};

function fieldsFor(isEdit) {
  return [
    NAME_FIELD,
    {
      name: 'file',
      type: 'file',
      label: isEdit ? 'Replace PDF (optional)' : 'Choose PDF',
      helperText: isEdit ? 'Leave empty to keep the current file' : undefined,
    },
  ];
}

// ----------------------------------------------------------------------

/**
 * One scoped PDF list: a subject's past papers, or the syllabus / notes / past
 * papers of one chapter. `filters` narrows the endpoint, `parentIds` is what a
 * create needs.
 *
 * Notes have no create button - students upload those, an admin only manages
 * them afterwards.
 */
export function AdminDocsView({ kind, heading, links, filters, parentIds }) {
  const hooks = documentHooks[kind];

  const list = useListQuery(hooks.useList, filters);

  const [uploadFile] = useUploadFileMutation();
  const [create] = hooks.useCreate();
  const [update] = hooks.useUpdate();
  const [remove] = hooks.useDelete();

  /** Uploads the chosen file, if any; nothing chosen means keep the current one. */
  const fileFields = async (values) => {
    if (!values.file) return {};

    const stored = await uploadFile(values.file).unwrap();

    return { file: stored.file, fileUrl: stored.fileUrl };
  };

  const columns = [nameColumn, ...(kind === 'note' ? [uploadedColumn] : []), fileColumn];

  return (
    <EntityList
      heading={heading}
      links={links}
      list={list}
      columns={columns}
      searchPlaceholder={`Search ${DOC_LABELS[kind].plural.toLowerCase()}...`}
      createLabel={`New ${DOC_LABELS[kind].singular.toLowerCase()}`}
      editLabel="Edit PDF"
      fields={fieldsFor}
      describe={(row) => row.name}
      deleteNote="Deleting marks the PDF deleted server side; students stop seeing it straight away."
      emptyValues={{ name: '', file: null }}
      toValues={(row) => ({ name: row.name, file: null })}
      onCreate={
        kind === 'note'
          ? undefined
          : async (values) =>
              create({ ...parentIds, name: values.name, ...(await fileFields(values)) }).unwrap()
      }
      onUpdate={async (row, values) =>
        update({ id: idOf(row), name: values.name, ...(await fileFields(values)) }).unwrap()
      }
      onToggleStatus={(row, status) => update({ id: idOf(row), status }).unwrap()}
      onDelete={(row) => remove(idOf(row)).unwrap()}
    />
  );
}

// ----------------------------------------------------------------------

/** Breadcrumb trail shared by the scoped document screens. */
export function docLinks({ course, level, subject, chapter, current }) {
  const courseId = idOf(course);
  const levelId = idOf(level);
  const subjectId = idOf(subject);

  return [
    { name: 'Admin', href: paths.admin.root },
    { name: 'Catalog', href: paths.admin.catalog.root },
    { name: course.name, href: paths.admin.catalog.course(courseId) },
    { name: level.name, href: paths.admin.catalog.level(courseId, levelId) },
    { name: subject.name, href: paths.admin.catalog.subject(courseId, levelId, subjectId) },
    ...(chapter
      ? [
          {
            name: chapter.name,
            href: paths.admin.catalog.chapter(courseId, levelId, subjectId, idOf(chapter)),
          },
        ]
      : []),
    { name: current },
  ];
}

import { idOf } from 'src/constants/nous';

import { AdminDocsView, docLinks } from './admin-docs-view';

// ----------------------------------------------------------------------

/**
 * Past papers for a whole subject. The list is not narrowed by chapter, so per
 * the API it also shows papers tagged to a chapter; a create from here leaves
 * `chapterId` out, which puts the paper on the subject.
 */
export function AdminSubjectPapersView({ course, level, subject }) {
  return (
    <AdminDocsView
      kind="past-paper"
      heading="Subject past papers"
      filters={{
        courseId: idOf(course),
        levelId: idOf(level),
        subjectId: idOf(subject),
      }}
      parentIds={{ subjectId: idOf(subject) }}
      links={docLinks({ course, level, subject, current: 'Past papers' })}
    />
  );
}

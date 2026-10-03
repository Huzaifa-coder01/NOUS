import { idOf } from 'src/constants/nous';

import { AdminDocsView, docLinks } from './admin-docs-view';

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

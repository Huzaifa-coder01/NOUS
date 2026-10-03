import { idOf } from 'src/constants/nous';

import { AdminDocsView, docLinks } from './admin-docs-view';

export function AdminChapterSectionView({ course, level, subject, chapter, section }) {
  const subjectId = idOf(subject);
  const chapterId = idOf(chapter);

  return (
    <AdminDocsView
      kind={section.kind}
      heading={`${section.name} - chapter ${chapter.chapterNumber}`}
      filters={{
        courseId: idOf(course),
        levelId: idOf(level),
        subjectId,
        chapterId,
      }}
      parentIds={section.kind === 'past-paper' ? { subjectId, chapterId } : { chapterId }}
      links={docLinks({ course, level, subject, chapter, current: section.name })}
    />
  );
}

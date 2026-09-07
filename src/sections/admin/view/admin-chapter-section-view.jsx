import { idOf } from 'src/constants/nous';

import { AdminDocsView, docLinks } from './admin-docs-view';

// ----------------------------------------------------------------------

/**
 * The syllabus / notes / past papers of one chapter, narrowed to course, level,
 * subject and chapter.
 *
 * A past paper created here carries both `subjectId` and `chapterId`; syllabus
 * and notes only ever need the chapter.
 */
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

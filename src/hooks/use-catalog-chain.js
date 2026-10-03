import { useParams } from 'react-router-dom';

import { sectionByRouteId } from 'src/constants/nous';
import {
  handleApiError,
  useGetCourseQuery,
  useGetLevelQuery,
  useGetSubjectQuery,
  useGetChapterQuery,
} from 'src/store';

export function useCatalogChain() {
  const { courseId, levelId, subjectId, chapterId, sectionId } = useParams();

  const course = useGetCourseQuery(courseId, { skip: !courseId });
  const level = useGetLevelQuery(levelId, { skip: !levelId });
  const subject = useGetSubjectQuery(subjectId, { skip: !subjectId });
  const chapter = useGetChapterQuery(chapterId, { skip: !chapterId });

  const section = sectionId ? sectionByRouteId(sectionId) : undefined;

  const parts = [
    [courseId, course],
    [levelId, level],
    [subjectId, subject],
    [chapterId, chapter],
  ];

  const required = parts.filter(([id]) => !!id);

  const loading = required.some(([, part]) => part.isLoading);

  const failed = required.find(([, part]) => part.error);

  const notFound =
    !loading &&
    (required.some(([, part]) => part.error || !part.data) || (!!sectionId && !section));

  return {
    ids: { courseId, levelId, subjectId, chapterId, sectionId },
    course: course.data,
    level: level.data,
    subject: subject.data,
    chapter: chapter.data,
    section,
    loading,
    notFound,
    error: failed ? { ...failed[1].error, message: handleApiError(failed[1].error) } : null,
  };
}

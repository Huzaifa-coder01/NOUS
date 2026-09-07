import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { handleApiError, documentHooks } from 'src/store';
import { CHAPTER_SECTIONS } from 'src/constants/nous';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';

import { LoadingScreen } from 'src/components/loading-screen';

import { NousSectionView } from 'src/sections/nous/view';

// ----------------------------------------------------------------------

/**
 * One hook per section kind, all three called unconditionally with only the one
 * that matches the url enabled - hooks cannot be chosen at runtime, and `skip`
 * means the other two never hit the network.
 */
function useSectionDocs(section, filters) {
  const results = CHAPTER_SECTIONS.map((entry) =>
    documentHooks[entry.kind].useList(filters, {
      skip: entry.kind !== section?.kind || !filters.chapterId,
    })
  );

  const index = CHAPTER_SECTIONS.findIndex((entry) => entry.kind === section?.kind);

  return results[index === -1 ? 0 : index];
}

export default function Page() {
  const { ids, course, level, subject, chapter, section, loading, notFound } = useCatalogChain();

  const docs = useSectionDocs(section, {
    courseId: ids.courseId,
    levelId: ids.levelId,
    subjectId: ids.subjectId,
    chapterId: ids.chapterId,
    limit: 100,
  });

  if (notFound) {
    return <Navigate to={paths.nous.root} replace />;
  }

  if (loading || !section || !chapter) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {`${section.name} - ${chapter.name} - ${CONFIG.site.name}`}</title>
      </Helmet>

      <NousSectionView
        course={course}
        level={level}
        subject={subject}
        chapter={chapter}
        section={section}
        docs={docs.data?.rows ?? []}
        error={docs.error && { message: handleApiError(docs.error) }}
        onRetry={docs.refetch}
      />
    </>
  );
}

import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';
import { handleApiError, useGetPastPapersQuery } from 'src/store';

import { LoadingScreen } from 'src/components/loading-screen';

import { NousSubjectPapersView } from 'src/sections/nous/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { ids, course, level, subject, loading, notFound } = useCatalogChain();

  // no chapterId: the API returns every paper under this subject
  const docs = useGetPastPapersQuery(
    {
      courseId: ids.courseId,
      levelId: ids.levelId,
      subjectId: ids.subjectId,
      limit: 100,
    },
    { skip: !ids.subjectId }
  );

  if (notFound) {
    return <Navigate to={paths.nous.root} replace />;
  }

  if (loading || !subject) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {`Past papers - ${subject.name} - ${CONFIG.site.name}`}</title>
      </Helmet>

      <NousSubjectPapersView
        course={course}
        level={level}
        subject={subject}
        docs={docs.data?.rows ?? []}
        error={docs.error && { message: handleApiError(docs.error) }}
        onRetry={docs.refetch}
      />
    </>
  );
}

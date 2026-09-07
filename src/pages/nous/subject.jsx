import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';
import { handleApiError, useGetChaptersQuery } from 'src/store';

import { LoadingScreen } from 'src/components/loading-screen';

import { NousSubjectView } from 'src/sections/nous/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { ids, course, level, subject, loading, notFound } = useCatalogChain();

  const chapters = useGetChaptersQuery(
    { subjectId: ids.subjectId, limit: 200 },
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
        <title> {`${subject.name} - ${CONFIG.site.name}`}</title>
      </Helmet>

      <NousSubjectView
        course={course}
        level={level}
        subject={subject}
        chapters={chapters.data?.rows ?? []}
        error={chapters.error && { message: handleApiError(chapters.error) }}
        onRetry={chapters.refetch}
      />
    </>
  );
}

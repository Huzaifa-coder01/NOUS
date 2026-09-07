import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';
import { handleApiError, useGetSubjectsQuery } from 'src/store';

import { LoadingScreen } from 'src/components/loading-screen';

import { NousLevelView } from 'src/sections/nous/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { ids, course, level, loading, notFound } = useCatalogChain();

  const subjects = useGetSubjectsQuery(
    { courseId: ids.courseId, levelId: ids.levelId, limit: 100 },
    { skip: !ids.levelId }
  );

  if (notFound) {
    return <Navigate to={paths.nous.root} replace />;
  }

  if (loading || !level) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {`${level.name} - ${CONFIG.site.name}`}</title>
      </Helmet>

      <NousLevelView
        course={course}
        level={level}
        subjects={subjects.data?.rows ?? []}
        error={subjects.error && { message: handleApiError(subjects.error) }}
        onRetry={subjects.refetch}
      />
    </>
  );
}

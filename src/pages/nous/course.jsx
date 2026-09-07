import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';
import { handleApiError, useGetLevelsQuery } from 'src/store';

import { LoadingScreen } from 'src/components/loading-screen';

import { NousCourseView } from 'src/sections/nous/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { ids, course, loading, notFound } = useCatalogChain();

  const levels = useGetLevelsQuery({ courseId: ids.courseId, limit: 100 }, { skip: !ids.courseId });

  if (notFound) {
    return <Navigate to={paths.nous.root} replace />;
  }

  if (loading || !course) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {`${course.name} - ${CONFIG.site.name}`}</title>
      </Helmet>

      <NousCourseView
        course={course}
        levels={levels.data?.rows ?? []}
        error={levels.error && { message: handleApiError(levels.error) }}
        onRetry={levels.refetch}
      />
    </>
  );
}

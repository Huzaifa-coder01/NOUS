import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';

import { LoadingScreen } from 'src/components/loading-screen';

import { AdminLevelView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { course, level, loading, notFound } = useCatalogChain();

  if (notFound) {
    return <Navigate to={paths.admin.catalog.root} replace />;
  }

  if (loading || !level) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {`${level.name} - Admin - ${CONFIG.site.name}`}</title>
      </Helmet>

      <AdminLevelView course={course} level={level} />
    </>
  );
}

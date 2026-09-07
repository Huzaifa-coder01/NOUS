import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';

import { LoadingScreen } from 'src/components/loading-screen';

import { AdminSubjectView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { course, level, subject, loading, notFound } = useCatalogChain();

  if (notFound) {
    return <Navigate to={paths.admin.catalog.root} replace />;
  }

  if (loading || !subject) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {`${subject.name} - Admin - ${CONFIG.site.name}`}</title>
      </Helmet>

      <AdminSubjectView course={course} level={level} subject={subject} />
    </>
  );
}

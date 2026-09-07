import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { useCatalogChain } from 'src/hooks/use-catalog-chain';

import { LoadingScreen } from 'src/components/loading-screen';

import { NousChapterView } from 'src/sections/nous/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { course, level, subject, chapter, loading, notFound } = useCatalogChain();

  if (notFound) {
    return <Navigate to={paths.nous.root} replace />;
  }

  if (loading || !chapter) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {`${chapter.name} - ${subject.name} - ${CONFIG.site.name}`}</title>
      </Helmet>

      <NousChapterView course={course} level={level} subject={subject} chapter={chapter} />
    </>
  );
}

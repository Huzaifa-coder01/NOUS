import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { contentCount } from 'src/constants/nous';
import { handleApiError, useGetCoursesQuery } from 'src/store';

import { LoadingScreen } from 'src/components/loading-screen';

import { NousHomeView } from 'src/sections/nous/view';

// ----------------------------------------------------------------------

export default function Page() {
  const { data, isLoading, error, refetch } = useGetCoursesQuery({ limit: 100 });

  const rows = data?.rows ?? [];

  const totals = useMemo(
    () =>
      rows.reduce(
        (sum, course) => ({
          courses: sum.courses + 1,
          levels: sum.levels + contentCount(course, 'activeLevels'),
          subjects: sum.subjects + contentCount(course, 'activeSubjects'),
        }),
        { courses: 0, levels: 0, subjects: 0 }
      ),
    [rows]
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title> {CONFIG.site.name}</title>
      </Helmet>

      <NousHomeView
        courses={rows}
        totals={totals}
        error={error && { message: handleApiError(error) }}
        onRetry={refetch}
      />
    </>
  );
}

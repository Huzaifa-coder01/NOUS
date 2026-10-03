import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { nousAccent } from 'src/theme/palette';
import { idOf, contentCount } from 'src/constants/nous';

import { useAuthContext } from 'src/auth/hooks';

import { Hero, NousCard, ScreenError } from '../components';
import { CardsGrid, EmptyState } from '../styles';

export function NousHomeView({ courses, totals, error, onRetry }) {
  const { user } = useAuthContext();

  const firstName = user?.name?.split(' ')[0];

  return (
    <>
      <Hero
        title={firstName ? `Welcome back, ${firstName}` : CONFIG.branding.homeTitle}
        subtitle={CONFIG.branding.homeSubtitle}
        stats={[
          `${totals.courses} courses`,
          `${totals.levels} levels`,
          `${totals.subjects} subjects`,
        ]}
      />

      {error ? (
        <ScreenError error={error} onRetry={onRetry} />
      ) : courses.length ? (
        <CardsGrid>
          {courses.map((course, index) => (
            <NousCard
              key={idOf(course)}
              href={paths.nous.course(idOf(course))}
              icon={course.emoji}
              title={course.name}
              description={course.description}
              meta={`${contentCount(course, 'activeLevels')} levels · ${contentCount(course, 'activeSubjects')} subjects`}
              accent={nousAccent(index)}
              action="Explore"
            />
          ))}
        </CardsGrid>
      ) : (
        <EmptyState>
          <strong>No courses available yet</strong>
          Courses appear here as soon as an administrator publishes them.
        </EmptyState>
      )}
    </>
  );
}

import { paths } from 'src/routes/paths';

import { nousAccent } from 'src/theme/palette';
import { idOf, contentCount } from 'src/constants/nous';

import { NousCard, PageTitle, BackButton, Breadcrumbs, ScreenError } from '../components';
import { CardsGrid, EmptyState } from '../styles';

// ----------------------------------------------------------------------

/** Step 2: `GET /levels?courseId=` - the active levels of the chosen course. */
export function NousCourseView({ course, levels, error, onRetry }) {
  return (
    <>
      <BackButton href={paths.nous.root} />

      <Breadcrumbs links={[{ name: 'Home', href: paths.nous.root }, { name: course.name }]} />

      <PageTitle title={course.name} subtitle="Select your level" />

      {error ? (
        <ScreenError error={error} onRetry={onRetry} />
      ) : levels.length ? (
        <CardsGrid>
          {levels.map((level, index) => (
            <NousCard
              key={idOf(level)}
              href={paths.nous.level(idOf(course), idOf(level))}
              icon={level.emoji || '\u{1F4D6}'}
              title={level.name}
              description="Explore subjects"
              meta={`${contentCount(level, 'activeSubjects')} subjects · ${contentCount(level, 'activeChapters')} chapters`}
              accent={nousAccent(index)}
            />
          ))}
        </CardsGrid>
      ) : (
        <EmptyState>
          <strong>No levels available yet</strong>
          {`Levels for ${course.name} appear here once an administrator publishes them.`}
        </EmptyState>
      )}
    </>
  );
}

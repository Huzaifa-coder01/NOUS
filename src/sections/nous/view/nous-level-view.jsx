import { paths } from 'src/routes/paths';

import { nousAccent } from 'src/theme/palette';
import { idOf, contentCount } from 'src/constants/nous';

import { NousCard, PageTitle, BackButton, Breadcrumbs, ScreenError } from '../components';
import { CardsGrid, EmptyState } from '../styles';

// ----------------------------------------------------------------------

/** Step 3: `GET /subjects?courseId=&levelId=`. */
export function NousLevelView({ course, level, subjects, error, onRetry }) {
  return (
    <>
      <BackButton href={paths.nous.course(idOf(course))} />

      <Breadcrumbs
        links={[
          { name: 'Home', href: paths.nous.root },
          { name: course.name, href: paths.nous.course(idOf(course)) },
          { name: level.name },
        ]}
      />

      <PageTitle title={level.name} subtitle="Select a subject" />

      {error ? (
        <ScreenError error={error} onRetry={onRetry} />
      ) : subjects.length ? (
        <CardsGrid>
          {subjects.map((subject, index) => {
            const papers = contentCount(subject, 'activePastPapers');

            return (
              <NousCard
                key={idOf(subject)}
                href={paths.nous.subject(idOf(course), idOf(level), idOf(subject))}
                icon={subject.emoji || '\u{1F4D8}'}
                title={subject.name}
                description="Chapters and past papers"
                meta={`${contentCount(subject, 'activeChapters')} chapters${papers ? ` · ${papers} past papers` : ''}`}
                accent={nousAccent(index)}
                action="Study"
              />
            );
          })}
        </CardsGrid>
      ) : (
        <EmptyState>
          <strong>No subjects available yet</strong>
          {`Subjects for ${level.name} appear here once an administrator publishes them.`}
        </EmptyState>
      )}
    </>
  );
}

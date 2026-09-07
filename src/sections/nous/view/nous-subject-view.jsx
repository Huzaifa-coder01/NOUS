import { paths } from 'src/routes/paths';

import { nousAccent } from 'src/theme/palette';
import { idOf, contentCount } from 'src/constants/nous';

import {
  NousCard,
  PageTitle,
  BackButton,
  ChapterCard,
  Breadcrumbs,
  ScreenError,
} from '../components';
import { CardsGrid, EmptyState, ListHeading } from '../styles';

// ----------------------------------------------------------------------

/**
 * Step 4: `GET /chapters?subjectId=`, plus the Past Papers entry.
 *
 * Past Papers here is the subject-wide list (`/past-papers?courseId&levelId&
 * subjectId`), which per the API includes papers tagged to a chapter.
 */
export function NousSubjectView({ course, level, subject, chapters, error, onRetry }) {
  const papers = contentCount(subject, 'activePastPapers');

  return (
    <>
      <BackButton href={paths.nous.level(idOf(course), idOf(level))} />

      <Breadcrumbs
        links={[
          { name: 'Home', href: paths.nous.root },
          { name: course.name, href: paths.nous.course(idOf(course)) },
          { name: level.name, href: paths.nous.level(idOf(course), idOf(level)) },
          { name: subject.name },
        ]}
      />

      <PageTitle
        title={subject.name}
        subtitle={`${contentCount(subject, 'activeChapters')} chapters \u00b7 ${papers} past papers`}
      />

      <CardsGrid>
        <NousCard
          href={paths.nous.subjectPastPapers(idOf(course), idOf(level), idOf(subject))}
          icon={'\u{1F4C4}'}
          title="Past Papers"
          description={`Every past paper for ${subject.name}`}
          meta={`${papers} PDF${papers === 1 ? '' : 's'}`}
          accent={nousAccent(2)}
          action="Open"
        />
      </CardsGrid>

      <ListHeading>
        Chapters <span>select one to open its syllabus, notes and past papers</span>
      </ListHeading>

      {error ? (
        <ScreenError error={error} onRetry={onRetry} />
      ) : chapters.length ? (
        chapters.map((chapter, index) => (
          <ChapterCard
            key={idOf(chapter)}
            index={index}
            href={paths.nous.chapter(idOf(course), idOf(level), idOf(subject), idOf(chapter))}
            chapter={chapter}
          />
        ))
      ) : (
        <EmptyState>
          <strong>No chapters available yet</strong>
          {`Chapters for ${subject.name} appear here once an administrator publishes them.`}
        </EmptyState>
      )}
    </>
  );
}

import { paths } from 'src/routes/paths';

import { idOf } from 'src/constants/nous';

import { PageTitle, BackButton, Breadcrumbs, ScreenError, DocumentList } from '../components';

// ----------------------------------------------------------------------

/**
 * Past Papers reached straight from the subject page:
 * `GET /past-papers?courseId&levelId&subjectId`, with no chapter filter, which
 * the API documents as everything under that subject including chapter-tagged
 * papers.
 */
export function NousSubjectPapersView({ course, level, subject, docs, error, onRetry }) {
  return (
    <>
      <BackButton href={paths.nous.subject(idOf(course), idOf(level), idOf(subject))} />

      <Breadcrumbs
        links={[
          { name: 'Home', href: paths.nous.root },
          { name: course.name, href: paths.nous.course(idOf(course)) },
          { name: level.name, href: paths.nous.level(idOf(course), idOf(level)) },
          {
            name: subject.name,
            href: paths.nous.subject(idOf(course), idOf(level), idOf(subject)),
          },
          { name: 'Past Papers' },
        ]}
      />

      <PageTitle
        title="Past Papers"
        subtitle={`${course.name} \u00b7 ${level.name} \u00b7 ${subject.name} \u00b7 ${docs.length} PDF${docs.length === 1 ? '' : 's'}`}
      />

      {error ? (
        <ScreenError error={error} onRetry={onRetry} />
      ) : (
        <DocumentList
          docs={docs}
          emptyTitle="No past papers yet"
          emptyHint={`Past papers for ${subject.name} appear here once an administrator publishes them.`}
        />
      )}
    </>
  );
}

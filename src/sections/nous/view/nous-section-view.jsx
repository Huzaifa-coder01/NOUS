import { paths } from 'src/routes/paths';

import { idOf } from 'src/constants/nous';

import {
  PageTitle,
  BackButton,
  NoteUpload,
  Breadcrumbs,
  ScreenError,
  DocumentList,
} from '../components';

// ----------------------------------------------------------------------

const EMPTY_HINT = {
  syllabus: 'Syllabus PDFs for this chapter appear here once an administrator publishes them.',
  'past-paper':
    'Past paper PDFs for this chapter appear here once an administrator publishes them.',
  note: 'Be the first to share your notes for this chapter - upload a PDF above.',
};

/**
 * Step 6: the PDFs behind one chapter section.
 *
 * Each section is its own endpoint, narrowed to course + level + subject +
 * chapter. Notes is the only one a student may add to.
 */
export function NousSectionView({
  course,
  level,
  subject,
  chapter,
  section,
  docs,
  error,
  onRetry,
}) {
  const ids = [idOf(course), idOf(level), idOf(subject), idOf(chapter)];

  return (
    <>
      <BackButton href={paths.nous.chapter(...ids)} />

      <Breadcrumbs
        links={[
          { name: 'Home', href: paths.nous.root },
          { name: course.name, href: paths.nous.course(idOf(course)) },
          { name: level.name, href: paths.nous.level(idOf(course), idOf(level)) },
          {
            name: subject.name,
            href: paths.nous.subject(idOf(course), idOf(level), idOf(subject)),
          },
          { name: chapter.name, href: paths.nous.chapter(...ids) },
          { name: section.name },
        ]}
      />

      <PageTitle
        title={section.name}
        subtitle={`${subject.name} \u00b7 ${chapter.name} \u00b7 ${docs.length} PDF${docs.length === 1 ? '' : 's'}`}
      />

      {section.kind === 'note' && <NoteUpload chapterId={idOf(chapter)} />}

      {error ? (
        <ScreenError error={error} onRetry={onRetry} />
      ) : (
        <DocumentList
          docs={docs}
          emptyTitle={`No ${section.name.toLowerCase()} yet`}
          emptyHint={EMPTY_HINT[section.kind]}
        />
      )}
    </>
  );
}

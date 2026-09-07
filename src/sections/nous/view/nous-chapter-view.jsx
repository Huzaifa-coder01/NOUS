import { paths } from 'src/routes/paths';

import { nousAccent } from 'src/theme/palette';
import { idOf, contentCount, CHAPTER_SECTIONS } from 'src/constants/nous';

import { PageTitle, BackButton, Breadcrumbs, SectionCard } from '../components';
import { ResourcesGrid } from '../styles';

// ----------------------------------------------------------------------

/**
 * Step 5: the three cards every chapter offers.
 *
 * The counts come straight off the chapter row's `contentCount`
 * ({ activeSyllabus, activeNotes, activePastPapers }), so this screen needs no
 * extra calls - exactly what the API documents it for.
 */
export function NousChapterView({ course, level, subject, chapter }) {
  const ids = [idOf(course), idOf(level), idOf(subject), idOf(chapter)];

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
          { name: `Chapter ${chapter.chapterNumber ?? ''}`.trim() },
        ]}
      />

      <PageTitle title={chapter.name} subtitle={`${subject.name} \u00b7 ${level.name}`} />

      <ResourcesGrid>
        {CHAPTER_SECTIONS.map((section, index) => (
          <SectionCard
            key={section.id}
            href={paths.nous.section(...ids, section.id)}
            icon={section.icon}
            name={section.name}
            description={section.description}
            accent={nousAccent(index)}
            count={contentCount(chapter, section.count)}
          />
        ))}
      </ResourcesGrid>
    </>
  );
}

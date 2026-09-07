import { ChapterCardRoot } from '../styles';

// ----------------------------------------------------------------------

export function ChapterCard({ href, chapter, index }) {
  return (
    <ChapterCardRoot href={href}>
      <div className="chapter-badge">{chapter.chapterNumber ?? index + 1}</div>

      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <span className="chapter-number">Chapter {chapter.chapterNumber ?? index + 1}</span>
        <strong>{chapter.name}</strong>
      </div>

      <div className="chapter-go">→</div>
    </ChapterCardRoot>
  );
}

import { ResourceCardRoot } from '../styles';

// ----------------------------------------------------------------------

/** One of the three chapter sections: Syllabus, Notes, Past Papers. */
export function SectionCard({ href, icon, name, description, accent, count }) {
  return (
    <ResourceCardRoot href={href} accent={accent}>
      <div className="resource-icon">{icon}</div>

      <h3>{name}</h3>
      <p>{description}</p>

      <span className="resource-count">
        {count > 0 ? `${count} PDF${count === 1 ? '' : 's'}` : 'Nothing yet'}
      </span>
    </ResourceCardRoot>
  );
}

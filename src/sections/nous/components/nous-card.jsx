import { NavCard, CardIcon, CardMeta } from '../styles';

// ----------------------------------------------------------------------

export function NousCard({ href, icon, title, description, meta, accent, action = 'Open' }) {
  return (
    <NavCard href={href} accent={accent}>
      <CardIcon accent={accent}>{icon}</CardIcon>

      <h2>{title}</h2>
      <p>{description}</p>

      {!!meta && (
        <CardMeta>
          <span>{meta}</span>
          <span className="go">{action} →</span>
        </CardMeta>
      )}
    </NavCard>
  );
}

import { RouterLink } from 'src/routes/components';

import { Crumbs } from '../styles';

// ----------------------------------------------------------------------

/** `links` is `[{ name, href? }]`; the last entry renders as the current page. */
export function Breadcrumbs({ links }) {
  return (
    <Crumbs aria-label="Breadcrumb">
      {links.map((link, index) => (
        <span key={link.name}>
          {index > 0 && <span className="sep">›&nbsp;</span>}

          {link.href ? (
            <RouterLink href={link.href}>{link.name}</RouterLink>
          ) : (
            <span className="current">{link.name}</span>
          )}
        </span>
      ))}
    </Crumbs>
  );
}

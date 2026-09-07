import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

/**
 * Where a signed-in account belongs: admins in the panel, students on the site.
 *
 * `returnTo` (set when a guard bounced someone to sign in) is only honoured when
 * it points somewhere that role may actually go — otherwise an admin who first
 * hit `/` would land on the student site, and a student sent to `/admin` would
 * bounce straight back out.
 */
export function getLandingPath(role, returnTo) {
  const isAdmin = role === 'admin';

  const adminArea = !!returnTo && returnTo.startsWith(paths.admin.root);

  if (returnTo && isAdmin === adminArea) {
    return returnTo;
  }

  return isAdmin ? paths.admin.root : paths.nous.root;
}

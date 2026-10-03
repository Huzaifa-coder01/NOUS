import { paths } from 'src/routes/paths';

export function getLandingPath(role, returnTo) {
  const isAdmin = role === 'admin';

  const adminArea = !!returnTo && returnTo.startsWith(paths.admin.root);

  if (returnTo && isAdmin === adminArea) {
    return returnTo;
  }

  return isAdmin ? paths.admin.root : paths.nous.root;
}

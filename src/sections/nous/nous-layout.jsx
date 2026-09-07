import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { mediaUrl } from 'src/store';

import { signOut } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';

import {
  Logo,
  Avatar,
  AppMain,
  AppRoot,
  AppHeader,
  AppFooter,
  HeaderNote,
  HeaderText,
  HeaderLink,
  HeaderButton,
  HeaderActions,
} from './styles';

// ----------------------------------------------------------------------

/**
 * The account picture, falling back to the initial.
 *
 * An account keeps the storage key its picture was uploaded under, so it has to
 * be resolved to a url before the browser can load it. If that url does not
 * load - an old key, or no delivery prefix configured - the initial takes over
 * rather than leaving a broken image in the header.
 */
function HeaderAvatar({ user }) {
  const photoURL = mediaUrl(user?.profileIcon);

  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [photoURL]);

  return (
    <Avatar>
      {photoURL && !broken ? (
        <img src={photoURL} alt="" onError={() => setBroken(true)} />
      ) : (
        user?.name?.charAt(0).toUpperCase()
      )}
    </Avatar>
  );
}

// ----------------------------------------------------------------------

export function NousLayout({ children }) {
  const branding = CONFIG.branding;

  const { user, isAdmin, checkUserSession } = useAuthContext();

  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    await checkUserSession();
    navigate(paths.auth.jwt.signIn, { replace: true });
  };

  return (
    <AppRoot>
      <AppHeader>
        <Logo href={paths.nous.root}>
          {branding.logoPrefix}
          <span>{branding.logoSuffix}</span>
        </Logo>

        <HeaderActions>
          <HeaderNote>{branding.headerNote}</HeaderNote>

          {isAdmin && <HeaderLink href={paths.admin.root}>Admin panel</HeaderLink>}

          <HeaderAvatar user={user} />

          <HeaderText>{user?.name}</HeaderText>

          <HeaderButton type="button" onClick={handleSignOut}>
            Sign out
          </HeaderButton>
        </HeaderActions>
      </AppHeader>

      <AppMain>{children}</AppMain>

      <AppFooter>{branding.footerText}</AppFooter>
    </AppRoot>
  );
}

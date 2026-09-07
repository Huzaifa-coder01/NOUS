import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { styled, useTheme, useColorScheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/config-global';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';

import { HeaderSection } from './header-section';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';

// ----------------------------------------------------------------------

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

// ----------------------------------------------------------------------

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,

  slotsDisplay: {
    signIn = true,
    account = true,
    helpLink = true,
    settings = true,
    purchase = true,
    contacts = true,
    searchbar = true,
    workspaces = true,
    menuButton = true,
    localization = true,
    notifications = true,
    navColorToggle = false,
  } = {},

  ...other
}) {
  const theme = useTheme();
  const settingsCtx = useSettingsContext();
  const { mode, setMode } = useColorScheme();

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        leftAreaStart: slots?.leftAreaStart,
        leftArea: (
          <>
            {slots?.leftAreaStart}

            {/* -- Menu button -- */}
            {menuButton && (
              <MenuButton
                data-slot="menu-button"
                onClick={onOpenNav}
                sx={{
                  mr: 1,
                  ml: -1,
                  [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                }}
              />
            )}

            {/* -- Logo -- */}
            <Logo data-slot="logo" />

            {/* -- Divider -- */}
            <StyledDivider data-slot="divider" />

            {/* -- Workspace popover -- */}
            {/* {workspaces && <WorkspacesPopover data-slot="workspaces" data={data?.workspaces} />} */}

            {/* {slots?.leftAreaEnd} */}
          </>
        ),
        rightArea: (
          <>
            {slots?.rightAreaStart}

            <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              {/* -- Help link -- */}
              {/* {helpLink && (
                <Link data-slot="help-link" href={paths.faqs} component={RouterLink} color="inherit" sx={{ typography: 'subtitle2' }}>
                  Need help?
                </Link>
              )} */}

              {/* -- Searchbar -- */}
              {/* {searchbar && <Searchbar data-slot="searchbar" data={data?.nav} />} */}

              {/* -- Language popover -- */}
              {/* {localization && <LanguagePopover data-slot="localization" data={data?.langs} />} */}

              {/* -- Notifications popover -- */}
              {/* {notifications && <NotificationsDrawer data-slot="notifications" data={data?.notifications} sx={{ mr: 0, ml: 1 }} />} */}

              {/* -- Contacts popover -- */}
              {/* {contacts && <ContactsPopover data-slot="contacts" data={data?.contacts} />} */}

              {/* -- Dark/light mode toggle -- */}
              <IconButton
                data-slot="color-scheme-toggle"
                aria-label="Toggle color scheme"
                onClick={() => {
                  const nextMode = mode === 'light' ? 'dark' : 'light';
                  settingsCtx.onUpdateField('colorScheme', nextMode);
                  setMode(nextMode);
                }}
              >
                {mode === 'light' ? (
                  <Iconify icon="solar:sun-2-bold" width={{ xs: 20, sm: 24 }} />
                ) : (
                  <Iconify icon="ion:moon-sharp" width={{ xs: 20, sm: 24 }} />
                )}
              </IconButton>

              {/* -- Nav color toggle (integrate / apparent) -- */}
              {/* {navColorToggle && (
                <IconButton
                  data-slot="nav-color-toggle"
                  aria-label="Toggle sidebar color style"
                  sx={{ mr: 1 }}
                  onClick={() => {
                    const nextNavColor =
                      settingsCtx.navColor === 'integrate' ? 'apparent' : 'integrate';
                    settingsCtx.onUpdateField('navColor', nextNavColor);
                  }}
                >
                  <SvgColor
                    src={`${CONFIG.site.basePath}/assets/icons/setting/ic-sidebar-${settingsCtx.navColor === 'integrate' ? 'outline' : 'filled'}.svg`}
                    sx={{ width: { xs: 20, sm: 24 }, height: { xs: 20, sm: 24 } }}
                  />
                </IconButton>
              )} */}

              {/* -- Settings button -- */}
              {/* <Box sx={{ pr: 1.5 }}>{settings && <SettingsButton data-slot="settings" />}</Box> */}

              {/* -- Account drawer -- */}
              {account && <AccountDrawer data-slot="account" data={data?.account} />}

              {/* -- Sign in button -- */}
              {signIn && <SignInButton />}

              {/* -- Purchase button -- */}
              {purchase && (
                <Button
                  data-slot="purchase"
                  variant="contained"
                  rel="noopener"
                  target="_blank"
                  href={paths.minimalStore}
                  sx={{
                    display: 'none',
                    [theme.breakpoints.up(layoutQuery)]: {
                      display: 'inline-flex',
                    },
                  }}
                >
                  Purchase
                </Button>
              )}
            </Box>

            {slots?.rightAreaEnd}
          </>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}

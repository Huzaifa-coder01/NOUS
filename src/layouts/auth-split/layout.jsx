import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { NOUS_COLORS } from 'src/theme/palette';

import { Section } from './section';
import { Main, Content } from './main';
import { LayoutSection } from '../core/layout-section';

// ----------------------------------------------------------------------

const layoutQuery = 'md';

/**
 * The original layout mounted `HeaderBase` with every slot disabled
 * (account, workspaces, searchbar, notifications, ... all `false`), so the only
 * thing it ever rendered here was the logo. It is a plain logo header now, which
 * keeps the same result without the popover/drawer/settings tree behind it.
 */
function Header() {
  return (
    <Box
      component="header"
      sx={{
        top: 0,
        left: 0,
        zIndex: 9,
        width: 1,
        px: { xs: 3, [layoutQuery]: 5 },
        py: { xs: 2, [layoutQuery]: 3 },
        position: { [layoutQuery]: 'fixed' },
      }}
    >
      <Box
        component={RouterLink}
        href={paths.nous.root}
        sx={{
          fontSize: 24,
          fontWeight: 'bold',
          textDecoration: 'none',
          color: NOUS_COLORS.dark,
          display: 'inline-block',
        }}
      >
        NO
        <Box component="span" sx={{ color: NOUS_COLORS.accent }}>
          US
        </Box>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function AuthSplitLayout({ sx, section, children }) {
  return (
    <LayoutSection
      headerSection={<Header />}
      footerSection={null}
      sx={sx}
      cssVars={{ '--layout-auth-content-width': '420px' }}
    >
      <Main layoutQuery={layoutQuery}>
        <Section layoutQuery={layoutQuery} {...section} />
        <Content layoutQuery={layoutQuery}>{children}</Content>
      </Main>
    </LayoutSection>
  );
}

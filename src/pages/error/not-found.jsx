import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';

import { NOUS_COLORS } from 'src/theme/palette';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Page not found - ${CONFIG.site.name}`}</title>
      </Helmet>

      <Box
        sx={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: NOUS_COLORS.background,
          textAlign: 'center',
          gap: 2,
          p: 3,
        }}
      >
        <Typography sx={{ fontSize: 64, fontWeight: 700, color: NOUS_COLORS.dark }}>404</Typography>

        <Typography variant="h4">Page not found</Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          The page you are looking for does not exist or has been moved.
        </Typography>

        <Button variant="contained" size="large" component={RouterLink} href={paths.nous.root}>
          Back to NOUS
        </Button>
      </Box>
    </>
  );
}

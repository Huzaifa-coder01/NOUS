import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

/**
 * The decorative half of the auth screen: gradient, orbit rings and a frosted
 * panel. Unchanged from the original except that the CSS-variable colours
 * (`varAlpha(theme.vars.palette.common.whiteChannel, x)`) are written as plain
 * rgba, which renders identically without the css-vars theme.
 */
const white = (opacity) => `rgba(255, 255, 255, ${opacity})`;

export function Section({
  sx,
  layoutQuery,
  eyebrow = 'Study Platform',
  title = 'Welcome back.',
  subtitle = `Everything you need for CA & ACCA`,
  description = 'Syllabus, notes and past papers for every chapter — organized by program, level and subject.',
  note = 'Sign in to unlock syllabus, notes and past papers.',
  ...other
}) {
  const theme = useTheme();

  const { dark: primaryDark, main: primaryMain, light: primaryLight } = theme.palette.primary;

  return (
    <Box
      sx={{
        flex: '1 1 0',
        px: { md: 6, lg: 8 },
        py: { md: 6, lg: 8 },
        width: 1,
        maxWidth: 'none',
        display: 'none',
        position: 'relative',
        overflow: 'hidden',
        color: 'common.white',
        bgcolor: primaryMain,
        backgroundImage: `linear-gradient(145deg, ${primaryDark} 0%, ${primaryMain} 52%, ${primaryLight} 100%)`,
        [theme.breakpoints.up(layoutQuery)]: {
          flex: '0 0 50%',
          maxWidth: '50%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          top: -120,
          left: -80,
          width: 520,
          height: 520,
          borderRadius: '50%',
          position: 'absolute',
          border: `1px solid ${white(0.18)}`,
        }}
      />

      <Box
        sx={{
          right: -180,
          bottom: -260,
          width: 820,
          height: 820,
          borderRadius: '50%',
          position: 'absolute',
          border: `1px solid ${white(0.12)}`,
        }}
      />

      <Box
        sx={{
          right: -120,
          bottom: -200,
          width: 680,
          height: 680,
          borderRadius: '50%',
          position: 'absolute',
          border: `1px solid ${white(0.1)}`,
        }}
      />

      <Box
        sx={{
          zIndex: 1,
          width: '66%',
          minWidth: { md: 390, lg: 450 },
          maxWidth: 650,
          borderRadius: 5,
          px: { md: 5, lg: 5 },
          py: { md: 5, lg: 5 },
          position: 'relative',
          border: `1px solid ${white(0.24)}`,
          bgcolor: white(0.14),
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.28)`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            position: 'absolute',
            pointerEvents: 'none',
            background: `linear-gradient(180deg, ${white(0.1)} 0%, ${white(0)} 100%)`,
          }}
        />

        <Box sx={{ zIndex: 1, position: 'relative' }}>
          <Typography
            sx={{
              mb: 2,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: white(0.8),
            }}
          >
            {eyebrow}
          </Typography>

          <Typography
            variant="h2"
            sx={{ lineHeight: 1.08, fontWeight: 800, fontSize: { md: '3.1rem', lg: '2.4rem' } }}
          >
            {title}
          </Typography>

          <Typography
            sx={{ mt: 2, fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.2, color: white(0.9) }}
          >
            {subtitle}
          </Typography>

          <Typography sx={{ mt: 3, fontSize: '1rem', lineHeight: 1.55, color: white(0.86) }}>
            {description}
          </Typography>

          <Typography sx={{ mt: 3, fontSize: '0.9rem', fontWeight: 500, color: white(0.78) }}>
            {note}
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{ zIndex: 1, mt: 3, fontSize: '0.875rem', color: white(0.58) }}
      >{`© ${new Date().getFullYear()} ${CONFIG.site.name}. All rights reserved.`}</Typography>
    </Box>
  );
}

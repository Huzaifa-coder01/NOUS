import { useId, forwardRef } from 'react';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

/**
 * The NOUS mark: an inline SVG monogram tinted with the theme's primary colour.
 * It is drawn rather than loaded so it can never 404 and needs no asset in
 * `public/`.
 */
export const Logo = forwardRef(
  ({ width = 45, height = 52, disableLink = false, className, href = '/', sx, ...other }, ref) => {
    const theme = useTheme();

    const gradientId = useId();

    const PRIMARY_LIGHT = theme.vars.palette.primary.light;

    const PRIMARY_MAIN = theme.vars.palette.primary.main;

    const PRIMARY_DARK = theme.vars.palette.primary.dark;

    const logo = (
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} />
            <stop offset="55%" stopColor={PRIMARY_MAIN} />
            <stop offset="100%" stopColor={PRIMARY_DARK} />
          </linearGradient>
        </defs>

        <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />

        {/* N monogram */}
        <path fill="#fff" d="M20 45V19h5.6l12.2 16.4V19H43v26h-5.5L25.3 28.6V45H20z" />

        {/* the open book NOUS is built around */}
        <path
          fill="#fff"
          fillOpacity="0.55"
          d="M18 49.2c3.7-1.5 7.4-1.5 11.1 0a1 1 0 0 0 .8 0c3.7-1.5 7.4-1.5 11.1 0a1 1 0 0 0 1.4-.9v-1.6a1 1 0 0 0-.6-.9c-3.9-1.6-7.8-1.6-11.7 0-3.9-1.6-7.8-1.6-11.7 0a1 1 0 0 0-.6.9v1.6a1 1 0 0 0 1.4.9z"
        />
      </svg>
    );

    return (
      <NoSsr
        fallback={
          <Box
            width={width}
            height={height}
            className={logoClasses.root.concat(className ? ` ${className}` : '')}
            sx={{ flexShrink: 0, display: 'inline-flex', verticalAlign: 'middle', ...sx }}
          />
        }
      >
        <Box
          ref={ref}
          component={RouterLink}
          href={href}
          width={width}
          height={height}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          aria-label="NOUS"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            verticalAlign: 'middle',
            ...(disableLink && { pointerEvents: 'none' }),
            ...sx,
          }}
          {...other}
        >
          {logo}
        </Box>
      </NoSsr>
    );
  }
);

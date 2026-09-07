import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { fNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

/**
 * A catalog counter: how many records of one kind are live, out of how many
 * exist.
 *
 * The template's summary widget pairs a number with a percentage delta and a
 * sparkline, but nothing here is measured over time - there is no history to
 * chart - so this shows the one ratio that is real instead of inventing a trend.
 */
export function AnalyticsStatTile({
  title,
  active,
  total,
  icon,
  hint,
  color = 'primary',
  sx,
  ...other
}) {
  const theme = useTheme();

  const percent = total ? Math.round((active / total) * 100) : 0;

  const card = (
    <Card
      sx={{
        ...bgGradient({
          color: `135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)}`,
        }),
        p: 3,
        boxShadow: 'none',
        position: 'relative',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 1.5 }}>
        <Box sx={{ typography: 'h3', lineHeight: 1 }}>{fNumber(active)}</Box>
        <Box sx={{ typography: 'body2', opacity: 0.72 }}>active of {fNumber(total)}</Box>
      </Box>

      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 6,
          bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.16),
          [`& .MuiLinearProgress-bar`]: { bgcolor: `${color}.dark` },
        }}
      />

      <SvgColor
        src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );

  return hint ? (
    <Tooltip title={hint} placement="top">
      {card}
    </Tooltip>
  ) : (
    card
  );
}

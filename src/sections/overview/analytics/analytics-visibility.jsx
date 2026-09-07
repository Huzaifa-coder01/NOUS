import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

/**
 * The three mutually exclusive states a document can be in, as one segmented
 * bar plus a readout.
 *
 * A donut is the wrong shape here: most of the time everything is active, and a
 * single-slice donut is just a filled circle that says nothing. A bar still
 * reads correctly at 100/0/0 and names all three states so the difference
 * between "switched off" and "hidden by a parent" is on screen.
 */
export function AnalyticsVisibility({ title, subheader, segments, ...other }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  const share = (value) => (total ? (value / total) * 100 : 0);

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={0.75} alignItems="baseline" sx={{ mb: 2.5 }}>
          <Typography variant="h3">{fNumber(segments[0]?.value ?? 0)}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            of {fNumber(total)} PDFs reach students
          </Typography>
        </Stack>

        <Box
          sx={{
            height: 12,
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.neutral',
          }}
        >
          {segments.map((segment) => (
            <Box
              key={segment.label}
              title={`${segment.label}: ${segment.value}`}
              sx={{
                width: `${share(segment.value)}%`,
                bgcolor: `${segment.color}.main`,
                transition: (theme) => theme.transitions.create('width'),
              }}
            />
          ))}
        </Box>

        <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />} sx={{ mt: 1 }}>
          {segments.map((segment) => (
            <Stack
              key={segment.label}
              direction="row"
              alignItems="flex-start"
              spacing={1.5}
              sx={{ py: 1.5, opacity: segment.value ? 1 : 0.5 }}
            >
              <Box
                sx={{
                  mt: 0.75,
                  width: 10,
                  height: 10,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: `${segment.color}.main`,
                }}
              />

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2">{segment.label}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }} component="div">
                  {segment.hint}
                </Typography>
              </Box>

              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                <Typography variant="subtitle2">{fNumber(segment.value)}</Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }} component="div">
                  {Math.round(share(segment.value))}%
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}

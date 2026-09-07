import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

function Row({ item }) {
  return (
    <Box
      component={RouterLink}
      href={item.href}
      sx={{
        px: 3,
        py: 2,
        gap: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'inherit',
        textDecoration: 'none',
        transition: (theme) => theme.transitions.create('background-color'),
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {!!item.icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${item.color ?? 'primary'}.main`,
            bgcolor: (theme) => theme.vars.palette[item.color ?? 'primary'].lighter,
          }}
        >
          <Iconify width={20} icon={item.icon} />
        </Box>
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {item.primary}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
          {item.secondary}
        </Typography>
      </Box>

      {!!item.badge && (
        <Label color={item.color ?? 'default'} sx={{ flexShrink: 0 }}>
          {item.badge}
        </Label>
      )}

      <Iconify
        width={18}
        icon="eva:arrow-ios-forward-fill"
        sx={{ flexShrink: 0, color: 'text.disabled' }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

/**
 * A list of things worth clicking through to. Every row is a real link into the
 * catalog, so the dashboard is a way in rather than a dead end.
 */
export function AnalyticsLinkList({
  title,
  subheader,
  list,
  emptyText,
  minHeight = 304,
  ...other
}) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 1 }} />

      <Scrollbar sx={{ minHeight }}>
        {list.length ? (
          <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
            {list.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              px: 3,
              py: 6,
              gap: 1,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              color: 'text.secondary',
              typography: 'body2',
            }}
          >
            <Iconify width={28} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
            {emptyText}
          </Box>
        )}
      </Scrollbar>
    </Card>
  );
}

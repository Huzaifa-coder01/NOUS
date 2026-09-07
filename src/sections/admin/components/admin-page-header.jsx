import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

/** Thin wrapper over the shared CustomBreadcrumbs, plus the admin page action. */
export function AdminPageHeader({ title, subtitle, links = [], action }) {
  return (
    <>
      <CustomBreadcrumbs
        heading={title}
        links={links.length ? links : [{ name: title }]}
        sx={{ mb: subtitle ? 1 : 3 }}
        action={
          action && (
            <Button
              variant="contained"
              size="large"
              onClick={action.onClick}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {action.label}
            </Button>
          )
        }
      />

      {!!subtitle && (
        <Typography sx={{ mb: 3, fontSize: 14, color: 'text.secondary' }}>{subtitle}</Typography>
      )}
    </>
  );
}

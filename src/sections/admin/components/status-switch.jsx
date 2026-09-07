import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

import { STATUS } from 'src/constants/nous';

import { toast } from 'src/components/snackbar';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const COLORS = {
  [STATUS.active]: 'success',
  [STATUS.inactive]: 'default',
  [STATUS.deleted]: 'error',
};

/**
 * Active / inactive toggle. Deactivating cascades to every descendant server
 * side, so the confirmation says as much.
 *
 * A row that has been deleted shows its state and cannot be toggled - the API
 * only accepts active | inactive on an update, `deleted` is set by DELETE.
 */
export function StatusSwitch({ row, onToggle, cascades = false }) {
  const [busy, setBusy] = useState(false);

  const active = row.status === STATUS.active;
  const deleted = row.status === STATUS.deleted;

  const handleChange = async (event) => {
    const next = event.target.checked ? STATUS.active : STATUS.inactive;

    setBusy(true);

    try {
      await onToggle(row, next);

      toast.success(
        next === STATUS.active
          ? 'Now active'
          : cascades
            ? 'Now inactive - everything under it was switched off too'
            : 'Now inactive'
      );
    } catch (error) {
      toast.error(error?.message ?? 'Could not change the status');
    } finally {
      setBusy(false);
    }
  };

  if (deleted) {
    return (
      <Tooltip title="Deleted records cannot be re-activated from here">
        <span>
          <Label color="error">Deleted</Label>
        </span>
      </Tooltip>
    );
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Switch size="small" checked={active} disabled={busy} onChange={handleChange} />

      <Label color={COLORS[row.status] ?? 'default'}>{active ? 'Active' : 'Inactive'}</Label>
    </Stack>
  );
}

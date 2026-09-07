import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { idOf, STATUS, STATUS_FILTERS } from 'src/constants/nous';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { EntityDialog } from './entity-dialog';
import { StatusSwitch } from './status-switch';

// ----------------------------------------------------------------------

/**
 * The shared admin list page, driven by the API rather than by an in-memory
 * array: search, status filtering and paging are all query params the backend
 * applies, and the row counters come from the response `meta`.
 *
 * `list` is a `useListRequest(...)` result, which owns the query state.
 *
 * There is no reorder or sort column here on purpose - the API exposes neither,
 * and sorting one page of many would be misleading.
 */
export function EntityList({
  heading,
  links,
  list,
  columns,
  searchPlaceholder = 'Search...',
  createLabel,
  editLabel,
  fields,
  emptyValues,
  toValues,
  onCreate,
  onUpdate,
  onDelete,
  onOpen,
  onToggleStatus,
  cascades = false,
  deleteNote,
  openLabel = 'Manage',
  describe = (row) => row.name,
  statusOf = (row) => row.status,
  statusFilters = STATUS_FILTERS,
  extraActions,
  toolbar,
}) {
  const { rows, total, counts, query, loading, error, refresh } = list;

  const confirmMany = useBoolean();

  const [dialog, setDialog] = useState(null);
  const [confirmRow, setConfirmRow] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState(query.keyword);

  // let the admin finish typing before asking the server again
  useEffect(() => {
    if (search === query.keyword) return undefined;

    const timer = setTimeout(() => list.setKeyword(search), 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // a page or filter change invalidates whatever was ticked
  useEffect(() => {
    setSelected([]);
  }, [query.page, query.keyword, query.status]);

  const pageKeys = rows.map(idOf);

  const toggleRow = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]));

  const handleSubmit = async (values) => {
    if (dialog?.mode === 'edit') {
      await onUpdate(dialog.row, values);
    } else {
      await onCreate(values);
    }

    toast.success(dialog?.mode === 'edit' ? 'Update success!' : 'Create success!');
    refresh();
  };

  const handleDeleteRow = async () => {
    const row = confirmRow;

    setConfirmRow(null);

    try {
      await onDelete(row);
      toast.success('Delete success!');
      refresh();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  };

  const handleDeleteRows = async () => {
    confirmMany.onFalse();

    const chosen = rows.filter((row) => selected.includes(idOf(row)));

    const results = await Promise.allSettled(chosen.map((row) => onDelete(row)));

    const failed = results.filter((result) => result.status === 'rejected');

    if (failed.length) {
      toast.error(failed[0].reason?.message ?? 'Some items could not be deleted');
    } else {
      toast.success('Delete success!');
    }

    setSelected([]);
    refresh();
  };

  const handleToggle = useCallback(
    async (row, status) => {
      await onToggleStatus(row, status);
      refresh();
    },
    [onToggleStatus, refresh]
  );

  const tableHead = [
    ...columns.map((column) => ({ id: column.id, label: column.label, width: column.width })),
    ...(onToggleStatus ? [{ id: 'status', label: 'Status', width: 160 }] : []),
    { id: '', width: 140 },
  ];

  /** Tab counters come from `meta`; fall back to the page when it is absent. */
  const countFor = (value) => {
    if (!counts?.total) return value === '' ? total : undefined;

    if (value === '') return counts.total;
    if (value === STATUS.active) return counts.active;
    if (value === STATUS.inactive) return counts.inactive;
    if (value === STATUS.deleted) return counts.deleted;

    return undefined;
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={heading}
        links={links}
        action={
          onCreate && (
            <Button
              variant="contained"
              onClick={() => setDialog({ mode: 'create' })}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {createLabel}
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={query.status}
          onChange={(event, value) => list.setStatus(value)}
          sx={{ px: 2.5, boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.grey[500]}14` }}
        >
          {statusFilters.map((tab) => {
            const count = countFor(tab.value);

            return (
              <Tab
                key={tab.value || 'all'}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  count === undefined ? undefined : (
                    <Label
                      variant={tab.value === query.status ? 'filled' : 'soft'}
                      color={
                        (tab.value === STATUS.active && 'success') ||
                        (tab.value === STATUS.deleted && 'error') ||
                        (tab.value === STATUS.inactive && 'default') ||
                        'info'
                      }
                    >
                      {count}
                    </Label>
                  )
                }
              />
            );
          })}
        </Tabs>

        <Stack spacing={2} sx={{ p: 2.5 }} direction={{ xs: 'column', md: 'row' }}>
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {extraActions}
        </Stack>

        {toolbar}

        {!!error && (
          <Alert
            severity="error"
            sx={{ mx: 2.5, mb: 2.5 }}
            action={
              <Button color="inherit" size="small" onClick={refresh}>
                Retry
              </Button>
            }
          >
            {error.message}
          </Alert>
        )}

        <Box sx={{ position: 'relative' }}>
          {loading && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9 }} />
          )}

          <TableSelectedAction
            numSelected={selected.length}
            rowCount={rows.length}
            onSelectAllRows={(checked) => setSelected(checked ? pageKeys : [])}
            action={
              onDelete && (
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmMany.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              )
            }
          />

          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHeadCustom
                headLabel={tableHead}
                rowCount={rows.length}
                numSelected={selected.length}
                onSelectAllRows={(checked) => setSelected(checked ? pageKeys : [])}
              />

              <TableBody>
                {rows.map((row) => {
                  const key = idOf(row);

                  return (
                    <TableRow
                      key={key}
                      hover
                      selected={selected.includes(key)}
                      sx={statusOf(row) === STATUS.active ? undefined : { opacity: 0.6 }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(key)} onClick={() => toggleRow(key)} />
                      </TableCell>

                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          sx={{ whiteSpace: column.nowrap ? 'nowrap' : undefined }}
                        >
                          {column.render ? column.render(row) : row[column.id]}
                        </TableCell>
                      ))}

                      {onToggleStatus && (
                        <TableCell>
                          <StatusSwitch row={row} cascades={cascades} onToggle={handleToggle} />
                        </TableCell>
                      )}

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {onUpdate && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => setDialog({ mode: 'edit', row })}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {onDelete && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setConfirmRow(row)}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {onOpen && (
                            <Button size="small" variant="contained" onClick={() => onOpen(row)}>
                              {openLabel}
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableNoData notFound={!loading && !error && !rows.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={query.page - 1}
          count={total}
          rowsPerPage={query.limit}
          onPageChange={(event, page) => list.setPage(page + 1)}
          onRowsPerPageChange={(event) => list.setLimit(Number(event.target.value))}
        />
      </Card>

      {!!fields && (
        <EntityDialog
          open={!!dialog}
          title={
            dialog?.mode === 'edit' ? editLabel ?? `Edit ${heading.toLowerCase()}` : createLabel
          }
          fields={typeof fields === 'function' ? fields(dialog?.mode === 'edit') : fields}
          initialValues={dialog?.mode === 'edit' ? toValues(dialog.row) : emptyValues}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={!!confirmRow}
        onClose={() => setConfirmRow(null)}
        title="Delete"
        content={
          confirmRow ? (
            <>
              <strong>{describe(confirmRow)}</strong> will be removed.
              {!!deleteNote && (
                <Box component="span" sx={{ display: 'block', mt: 1 }}>
                  {deleteNote}
                </Box>
              )}
            </>
          ) : (
            ''
          )
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRow}>
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmMany.value}
        onClose={confirmMany.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selected.length} </strong> items?
            {!!deleteNote && (
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                {deleteNote}
              </Box>
            )}
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRows}>
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { idOf, STATUS, USER_STATUS_FILTERS } from 'src/constants/nous';
import { useListQuery } from 'src/hooks/use-list-query';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  mediaUrl,
} from 'src/store';

import { Label } from 'src/components/label';

import { EntityList } from 'src/sections/admin/components/entity-list';

// ----------------------------------------------------------------------

const USER_TYPES = [
  { value: 'student', label: 'Students' },
  { value: 'admin', label: 'Admins' },
  { value: '', label: 'Everyone' },
];

const CREATE_FIELDS = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email address', required: true },
  { name: 'password', label: 'Password', required: true, helperText: 'At least 8 characters' },
  {
    name: 'userType',
    label: 'Account type',
    type: 'select',
    options: [
      { value: 'student', label: 'Student' },
      { value: 'admin', label: 'Admin' },
    ],
  },
];

const EDIT_FIELDS = [{ name: 'name', label: 'Full name', required: true }];

const COLUMNS = [
  {
    id: 'name',
    label: 'Name',
    render: (row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar alt={row.name} src={mediaUrl(row.profileIcon) || undefined}>
          {row.name?.charAt(0)?.toUpperCase()}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }} noWrap component="div">
            {row.email}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    id: 'userType',
    label: 'Type',
    width: 130,
    render: (row) => (
      <Label color={row.userType === 'admin' ? 'info' : 'default'}>
        {row.userType === 'admin' ? 'Admin' : 'Student'}
      </Label>
    ),
  },
  {
    id: 'createdAt',
    label: 'Joined',
    width: 150,
    render: (row) => (
      <Typography variant="body2">{row.createdAt ? fDate(row.createdAt) : '—'}</Typography>
    ),
  },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const [userType, setUserType] = useState('student');

  const list = useListQuery(useGetUsersQuery, { userType });

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  return (
    <EntityList
      heading="Users"
      links={[{ name: 'Admin', href: paths.admin.root }, { name: 'Users' }]}
      list={list}
      columns={COLUMNS}
      searchPlaceholder="Search by name or email..."
      createLabel="New user"
      editLabel="Edit user"
      fields={(isEdit) => (isEdit ? EDIT_FIELDS : CREATE_FIELDS)}
      emptyValues={{ name: '', email: '', password: '', userType: 'student' }}
      toValues={(row) => ({ name: row.name })}
      describe={(row) => row.name}
      deleteNote="The account is removed server side and can no longer sign in."
      onCreate={(values) => createUser(values).unwrap()}
      onUpdate={(row, values) => updateUser({ id: idOf(row), name: values.name }).unwrap()}
      onToggleStatus={(row, status) => updateUser({ id: idOf(row), status }).unwrap()}
      onDelete={(row) => deleteUser(idOf(row)).unwrap()}
      statusOf={(row) => row.status ?? STATUS.active}
      statusFilters={USER_STATUS_FILTERS}
      toolbar={
        <Tabs
          value={userType}
          onChange={(event, value) => setUserType(value)}
          sx={{ px: 2.5, pb: 1 }}
        >
          {USER_TYPES.map((tab) => (
            <Tab key={tab.value || 'all'} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      }
    />
  );
}

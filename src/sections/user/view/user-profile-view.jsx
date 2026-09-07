import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { idOf } from 'src/constants/nous';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  mediaUrl,
  useGetUsersQuery,
  useGetLevelsQuery,
  useGetCoursesQuery,
  useGetSubjectsQuery,
  useGetChaptersQuery,
} from 'src/store';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { ProfileCover } from '../profile-cover';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'profile', label: 'Profile', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'catalog', label: 'Catalog', icon: <Iconify icon="solar:notebook-bold" width={24} /> },
];

// ----------------------------------------------------------------------

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Iconify icon={icon} width={22} sx={{ color: 'text.disabled' }} />

      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  );
}

function StatCard({ label, value }) {
  return (
    <Card sx={{ py: 3, textAlign: 'center' }}>
      <Typography variant="h4">{value}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function UserProfileView() {
  const { user } = useAuthContext();

  const tabs = useTabs('profile');

  const courses = useGetCoursesQuery({ page: 1, limit: 50 });

  // one page-of-one query per resource is enough: the counters live in `meta`
  const head = { page: 1, limit: 1 };

  const courseHead = useGetCoursesQuery(head);
  const levelHead = useGetLevelsQuery(head);
  const subjectHead = useGetSubjectsQuery(head);
  const chapterHead = useGetChaptersQuery(head);

  const stats = useMemo(
    () => ({
      courses: courseHead.data?.counts?.total ?? 0,
      levels: levelHead.data?.counts?.total ?? 0,
      subjects: subjectHead.data?.counts?.total ?? 0,
      chapters: chapterHead.data?.counts?.total ?? 0,
    }),
    [courseHead.data, levelHead.data, subjectHead.data, chapterHead.data]
  );

  const renderProfile = (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Account
          </Typography>

          <Stack spacing={2}>
            <InfoRow icon="solar:user-bold" label="Name" value={user?.name} />
            <InfoRow icon="solar:letter-bold" label="Email" value={user?.email} />
            <InfoRow
              icon="solar:shield-user-bold"
              label="Role"
              value={user?.role === 'admin' ? 'Administrator' : 'Student'}
            />
            <InfoRow
              icon="solar:calendar-date-bold"
              label="Joined"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            />
          </Stack>
        </Card>
      </Grid>

      <Grid xs={12} md={8}>
        <Grid container spacing={3}>
          <Grid xs={6} sm={3}>
            <StatCard label="Courses" value={stats.courses} />
          </Grid>
          <Grid xs={6} sm={3}>
            <StatCard label="Subjects" value={stats.subjects} />
          </Grid>
          <Grid xs={6} sm={3}>
            <StatCard label="Chapters" value={stats.chapters} />
          </Grid>
          <Grid xs={6} sm={3}>
            <StatCard label="Levels" value={stats.levels} />
          </Grid>

          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                What you can manage
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                As an administrator you control the entire catalog — courses, levels, subjects,
                chapters and the syllabus, notes and past papers students read — plus every account.
                Students can only upload notes.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const renderCatalog = (
    <Card>
      {(courses.data?.rows ?? []).map((course, index) => (
        <Box key={idOf(course)}>
          {index > 0 && <Divider />}

          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 3 }}>
            <Box sx={{ fontSize: 28 }}>{course.emoji}</Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">{course.name}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {course.contentCount?.activeLevels ?? 0} levels ·{' '}
                {course.contentCount?.activeSubjects ?? 0} subjects
              </Typography>
            </Box>

            <Label color={course.status === 'active' ? 'success' : 'default'}>
              {course.status}
            </Label>
          </Stack>
        </Box>
      ))}
    </Card>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[{ name: 'Admin', href: paths.admin.root }, { name: 'Profile' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={user?.role === 'admin' ? 'Administrator' : 'Student'}
          name={user?.name}
          avatarUrl={mediaUrl(user?.profileIcon) || undefined}
          coverUrl="/assets/background/background-4.jpg"
        />

        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            position: 'absolute',
            bgcolor: 'background.paper',
            [`& .MuiTabs-flexContainer`]: {
              pr: { md: 3 },
              justifyContent: { xs: 'center', md: 'flex-end' },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {tabs.value === 'profile' && renderProfile}
      {tabs.value === 'catalog' && renderCatalog}
    </DashboardContent>
  );
}

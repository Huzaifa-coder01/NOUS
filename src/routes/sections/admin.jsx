import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { RoleGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const AnalyticsPage = lazy(() => import('src/pages/admin/analytics'));
const UsersPage = lazy(() => import('src/pages/admin/users'));
const ProfilePage = lazy(() => import('src/pages/admin/profile'));
// const SettingsPage = lazy(() => import('src/pages/admin/settings'));
const CatalogPage = lazy(() => import('src/pages/admin/catalog'));
const CatalogCoursePage = lazy(() => import('src/pages/admin/catalog-course'));
const CatalogLevelPage = lazy(() => import('src/pages/admin/catalog-level'));
const CatalogSubjectPage = lazy(() => import('src/pages/admin/catalog-subject'));
const CatalogSubjectPapersPage = lazy(() => import('src/pages/admin/catalog-subject-papers'));
const CatalogChapterPage = lazy(() => import('src/pages/admin/catalog-chapter'));
const CatalogChapterSectionPage = lazy(() => import('src/pages/admin/catalog-chapter-section'));
const LevelsPage = lazy(() => import('src/pages/admin/levels'));
const SubjectsPage = lazy(() => import('src/pages/admin/subjects'));
const ChaptersPage = lazy(() => import('src/pages/admin/chapters'));
const PastPapersPage = lazy(() => import('src/pages/admin/past-papers'));
const SyllabusPage = lazy(() => import('src/pages/admin/syllabus'));
const NotesPage = lazy(() => import('src/pages/admin/notes'));

// ----------------------------------------------------------------------

export const adminRoutes = [
  {
    path: 'admin',
    element: (
      // admin role required - students are sent back to the student site
      <RoleGuard roles={['admin']}>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </RoleGuard>
    ),
    children: [
      { index: true, element: <AnalyticsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'levels', element: <LevelsPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'chapters', element: <ChaptersPage /> },
      { path: 'past-papers', element: <PastPapersPage /> },
      { path: 'syllabus', element: <SyllabusPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      // { path: 'settings', element: <SettingsPage /> },
      {
        path: 'catalog',
        children: [
          { index: true, element: <CatalogPage /> },
          { path: ':courseId', element: <CatalogCoursePage /> },
          { path: ':courseId/:levelId', element: <CatalogLevelPage /> },
          { path: ':courseId/:levelId/:subjectId', element: <CatalogSubjectPage /> },
          {
            // subject level past papers - static segment, ranks above :chapterId
            path: ':courseId/:levelId/:subjectId/past-papers',
            element: <CatalogSubjectPapersPage />,
          },
          { path: ':courseId/:levelId/:subjectId/:chapterId', element: <CatalogChapterPage /> },
          {
            // syllabus | notes | past-papers inside a chapter
            path: ':courseId/:levelId/:subjectId/:chapterId/:sectionId',
            element: <CatalogChapterSectionPage />,
          },
        ],
      },
    ],
  },
];

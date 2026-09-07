import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { NousLayout } from 'src/sections/nous';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/nous/home'));
const CoursePage = lazy(() => import('src/pages/nous/course'));
const LevelPage = lazy(() => import('src/pages/nous/level'));
const SubjectPage = lazy(() => import('src/pages/nous/subject'));
const SubjectPapersPage = lazy(() => import('src/pages/nous/subject-papers'));
const ChapterPage = lazy(() => import('src/pages/nous/chapter'));
const SectionPage = lazy(() => import('src/pages/nous/section'));

// ----------------------------------------------------------------------

export const nousRoutes = [
  {
    element: (
      // the student site requires an account; sign in decides where you land
      <AuthGuard>
        <NousLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </NousLayout>
      </AuthGuard>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: 'courses',
        children: [
          { index: true, element: <HomePage /> },
          { path: ':courseId', element: <CoursePage /> },
          { path: ':courseId/:levelId', element: <LevelPage /> },
          { path: ':courseId/:levelId/:subjectId', element: <SubjectPage /> },
          {
            // past papers for the subject itself - ranks above :chapterId
            path: ':courseId/:levelId/:subjectId/past-papers',
            element: <SubjectPapersPage />,
          },
          { path: ':courseId/:levelId/:subjectId/:chapterId', element: <ChapterPage /> },
          {
            // syllabus | notes | past-papers inside a chapter
            path: ':courseId/:levelId/:subjectId/:chapterId/:sectionId',
            element: <SectionPage />,
          },
        ],
      },
    ],
  },
];

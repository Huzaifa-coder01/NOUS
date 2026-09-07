import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { LoadingScreen } from 'src/components/loading-screen';

import { authRoutes } from './auth';
import { nousRoutes } from './nous';
import { adminRoutes } from './admin';

// ----------------------------------------------------------------------

const NotFoundPage = lazy(() => import('src/pages/error/not-found'));

export function Router() {
  return useRoutes([
    // Public NOUS site
    ...nousRoutes,

    // Sign in / sign up
    ...authRoutes,

    // Admin panel (role: admin)
    ...adminRoutes,

    {
      path: '404',
      element: (
        <Suspense fallback={<LoadingScreen />}>
          <NotFoundPage />
        </Suspense>
      ),
    },

    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { LoadingScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const SignInPage = lazy(() => import('src/pages/auth/sign-in'));
const SignUpPage = lazy(() => import('src/pages/auth/sign-up'));
const VerifyEmailPage = lazy(() => import('src/pages/auth/verify-email'));
const ForgetPasswordPage = lazy(() => import('src/pages/auth/forget-password'));
const VerifyPasswordPage = lazy(() => import('src/pages/auth/verify-password'));
const ResetPasswordPage = lazy(() => import('src/pages/auth/reset-password'));

// ----------------------------------------------------------------------

/** Wraps a page in the split layout, with copy for the decorative half. */
function withLayout(element, section) {
  return (
    <AuthSplitLayout section={section}>
      <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
    </AuthSplitLayout>
  );
}

export const authRoutes = [
  {
    path: 'auth',
    element: (
      <GuestGuard>
        <Outlet />
      </GuestGuard>
    ),
    children: [
      { path: 'sign-in', element: withLayout(<SignInPage />) },
      {
        path: 'sign-up',
        element: withLayout(<SignUpPage />, {
          eyebrow: 'Join NOUS',
          title: 'Start studying.',
          subtitle: 'Free access to every chapter',
          description:
            'Create an account to open the syllabus, notes and past papers for any chapter in CA or ACCA.',
          note: 'No card required.',
        }),
      },
      {
        path: 'verify-email',
        element: withLayout(<VerifyEmailPage />, {
          eyebrow: 'One last step',
          title: 'Check your inbox.',
          subtitle: 'Confirm your email address',
          description:
            'Your account stays pending until the code is verified. Verifying signs you straight in.',
          note: 'The code expires in 10 minutes.',
        }),
      },
      {
        path: 'forget-password',
        element: withLayout(<ForgetPasswordPage />, {
          eyebrow: 'Account recovery',
          title: 'Locked out?',
          subtitle: 'We will send you a one-time code',
          description: 'Enter your email and we will send a code to set a new password.',
          note: 'The code expires in 10 minutes.',
        }),
      },
      {
        path: 'verify-password',
        element: withLayout(<VerifyPasswordPage />, {
          eyebrow: 'Account recovery',
          title: 'Check your inbox.',
          subtitle: 'Enter the 6-digit code',
          description: 'The code confirms the account is yours before you choose a new password.',
          note: 'The code expires in 10 minutes.',
        }),
      },
      {
        path: 'reset-password',
        element: withLayout(<ResetPasswordPage />, {
          eyebrow: 'Account recovery',
          title: 'Almost there.',
          subtitle: 'Choose a new password',
          description: 'Pick something at least 6 characters long, then sign in with it.',
          note: 'You will be asked to sign in again.',
        }),
      },
    ],
  },
];

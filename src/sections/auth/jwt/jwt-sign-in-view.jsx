import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { getLandingPath } from 'src/auth/utils';
import { signIn } from 'src/auth/context/jwt';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const { checkUserSession } = useAuthContext();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');

    try {
      // one form for both roles: the action retries with the admin gate header
      // when the backend rejects the credentials without it
      const user = await signIn({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      await checkUserSession();

      const role = user?.accountState?.userType === 'admin' ? 'admin' : 'user';

      // admins land in the panel, students on the study site
      navigate(getLandingPath(role, searchParams.get('returnTo')), { replace: true });
    } catch (error) {
      console.error(error);

      // an unverified account cannot sign in at all, so send them to the screen
      // that can fix it rather than showing a message they cannot act on
      if (error?.needsEmailVerification) {
        navigate(paths.auth.jwt.verifyEmail);

        return;
      }

      setErrorMsg(error instanceof Error ? error.message : String(error));
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Sign in to your account</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          New to {CONFIG.site.name}?
        </Typography>

        <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
          Create an account
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

      <Stack spacing={1.5}>
        <Link
          component={RouterLink}
          href={paths.auth.jwt.forgetPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Forgot password?
        </Link>

        <Field.Text
          name="password"
          label="Password"
          placeholder="6+ characters"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Signing in..."
      >
        Sign in
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}

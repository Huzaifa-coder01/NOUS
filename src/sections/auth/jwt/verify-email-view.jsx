import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { getPendingSignUp, resendSignUpOtp, verifySignUpOtp } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const VerifyEmailSchema = zod.object({
  otp: zod
    .string()
    .min(4, { message: 'Code is required!' })
    .max(6, { message: 'Code must be 4-6 digits!' }),
});

// ----------------------------------------------------------------------

/**
 * The second half of sign up. `POST /auth/register` leaves the account pending
 * and emails an OTP; verifying it activates the account and returns the session
 * token, so this is where a new student actually gets signed in.
 */
export function JwtVerifyEmailView() {
  const navigate = useNavigate();

  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');
  const [pending, setPending] = useState(() => getPendingSignUp());
  const [resending, setResending] = useState(false);

  const methods = useForm({
    resolver: zodResolver(VerifyEmailSchema),
    defaultValues: { otp: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');

    try {
      const user = await verifySignUpOtp({ otp: data.otp });

      await checkUserSession();

      // a fresh account is always a student
      const isAdmin = user?.accountState?.userType === 'admin';

      navigate(isAdmin ? paths.admin.root : paths.nous.root, { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : String(error));
    }
  });

  const handleResend = async () => {
    setErrorMsg('');
    setResending(true);

    try {
      setPending(await resendSignUpOtp());
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : String(error));
    } finally {
      setResending(false);
    }
  };

  if (!pending?.email) {
    return (
      <Stack spacing={3}>
        <Typography variant="h5">Verify your email</Typography>

        <Alert severity="info">
          We do not have a sign up in progress in this tab. Start again and we will email you a
          fresh code.
        </Alert>

        <Button component={RouterLink} href={paths.auth.jwt.signUp} variant="contained">
          Back to sign up
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5">Verify your email</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`Enter the code we sent to ${pending.email}. Your account stays pending until it is verified.`}
        </Typography>
      </Stack>

      {/* on localhost the backend returns the OTP in the response body */}
      {!!pending.otp && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Dev build — your code is <strong>{pending.otp}</strong>
        </Alert>
      )}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text
            name="otp"
            label="Verification code"
            placeholder="Enter the code"
            InputLabelProps={{ shrink: true }}
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
          />

          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="Verifying..."
          >
            Verify and continue
          </LoadingButton>

          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Did not get it?
            </Typography>
            <Link
              component="button"
              type="button"
              variant="subtitle2"
              disabled={resending}
              onClick={handleResend}
            >
              {resending ? 'Sending...' : 'Send a new code'}
            </Link>
          </Stack>

          <Link
            component={RouterLink}
            href={paths.auth.jwt.signIn}
            variant="subtitle2"
            sx={{ alignSelf: 'center' }}
          >
            Back to sign in
          </Link>
        </Stack>
      </Form>
    </>
  );
}

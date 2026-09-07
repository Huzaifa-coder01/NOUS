import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Form, Field } from 'src/components/hook-form';

import { getPendingReset, verifyResetCode } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const OtpVerifySchema = zod.object({
  otp: zod
    .string()
    .min(4, { message: 'OTP is required!' })
    .max(6, { message: 'OTP must be 4-6 digits!' }),
});

// ----------------------------------------------------------------------

export function JwtVerifyPasswordView() {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState('');

  // on localhost the backend returns the OTP in the response body
  const pending = getPendingReset();

  const methods = useForm({
    resolver: zodResolver(OtpVerifySchema),
    defaultValues: { otp: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');

    try {
      await verifyResetCode({ code: data.otp });

      navigate(paths.auth.jwt.resetPassword);
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : String(error));
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Verify OTP</Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {pending?.email
          ? `Enter the 6-digit code sent to ${pending.email}.`
          : 'Enter the code from your reset email.'}
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="otp"
        label="OTP Code"
        placeholder="Enter OTP"
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
        Verify
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.forgetPassword}
        variant="subtitle2"
        sx={{ alignSelf: 'center' }}
      >
        Request a new code
      </Link>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!pending?.otp && (
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
        {renderForm}
      </Form>
    </>
  );
}

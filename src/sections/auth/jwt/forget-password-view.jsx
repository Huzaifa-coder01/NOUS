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

import { requestPasswordReset } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const ForgetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function JwtForgetPasswordView() {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState('');

  const methods = useForm({
    resolver: zodResolver(ForgetPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');

    try {
      await requestPasswordReset({ email: data.email });

      navigate(paths.auth.jwt.verifyPassword);
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : String(error));
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Forget your password?</Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Enter the email tied to your account and we will send a one-time code.
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email address"
        placeholder="Enter your email"
        InputLabelProps={{ shrink: true }}
      />

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sending code..."
      >
        Send reset code
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.signIn}
        variant="subtitle2"
        sx={{ alignSelf: 'center' }}
      >
        Back to sign in
      </Link>
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

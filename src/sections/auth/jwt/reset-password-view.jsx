import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

import { resetPassword } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod
  .object({
    newPassword: zod.string().min(6, { message: 'New password must be at least 6 characters!' }),
    confirmPassword: zod.string().min(6, { message: 'Please confirm your new password!' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------

export function JwtResetPasswordView() {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState('');

  const newPassword = useBoolean();
  const confirmPassword = useBoolean();

  const defaultValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setErrorMsg('');

    try {
      await resetPassword({ password: data.newPassword });

      navigate(paths.auth.jwt.signIn, { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : String(error));
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Reset your password</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Please enter your new password and confirm it below.
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="newPassword"
        label="New Password"
        placeholder="Enter your new password"
        type={newPassword.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={newPassword.onToggle} edge="end">
                <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your new password"
        type={confirmPassword.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle} edge="end">
                <Iconify
                  icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="primary"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Resetting..."
      >
        Reset Password
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

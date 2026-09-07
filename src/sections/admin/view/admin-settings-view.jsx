import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useToast } from 'src/hooks/use-toast';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  handleApiError,
  useGetAboutUsQuery,
  useGetPrivacyPolicyQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
  useGetTermsConditionsQuery,
  useGetCustomerTermsConditionsQuery,
} from 'src/store';

import { AdminPageHeader } from '../components/admin-page-header';

// ----------------------------------------------------------------------

const FIELDS = [
  { name: 'terms_and_conditions', label: 'Terms and conditions' },
  { name: 'customer_terms_and_conditions', label: 'Customer terms and conditions' },
  { name: 'privacy_policy', label: 'Privacy policy' },
  { name: 'about_us', label: 'About us' },
];

// ----------------------------------------------------------------------

export function AdminSettingsView() {
  const { showToast, showError, toastNode } = useToast();

  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  /**
   * There is no single "get settings" endpoint - each document has its own GET
   * - so the form is seeded from the four of them. RTK Query runs them in
   * parallel and caches each one; the id that comes back decides create vs
   * update.
   */
  const terms = useGetTermsConditionsQuery();
  const customerTerms = useGetCustomerTermsConditionsQuery();
  const privacy = useGetPrivacyPolicyQuery();
  const about = useGetAboutUsQuery();

  const [createSettings] = useCreateSettingsMutation();
  const [updateSettings] = useUpdateSettingsMutation();

  const loading =
    terms.isLoading || customerTerms.isLoading || privacy.isLoading || about.isLoading;

  const loadError = terms.error ?? privacy.error ?? about.error ?? null;

  const loaded = useMemo(() => {
    const pick = (record, key) =>
      typeof record === 'string' ? record : record?.[key] ?? record?.content ?? '';

    return {
      id: terms.data?._id ?? privacy.data?._id ?? about.data?._id ?? null,
      terms_and_conditions: pick(terms.data, 'terms_and_conditions'),
      customer_terms_and_conditions: pick(customerTerms.data, 'customer_terms_and_conditions'),
      privacy_policy: pick(privacy.data, 'privacy_policy'),
      about_us: pick(about.data, 'about_us'),
    };
  }, [terms.data, customerTerms.data, privacy.data, about.data]);

  useEffect(() => {
    if (!loading) setValues(loaded);
  }, [loading, loaded]);

  const handleChange = (name) => (event) =>
    setValues((prev) => ({ ...prev, [name]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    const body = Object.fromEntries(FIELDS.map((field) => [field.name, values[field.name] ?? '']));

    try {
      if (values.id) {
        await updateSettings({ id: values.id, ...body }).unwrap();
      } else {
        await createSettings(body).unwrap();
      }

      showToast('Settings saved');
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardContent>
      <AdminPageHeader
        title="Settings"
        subtitle="The legal and about copy the API serves, plus this build's connection details"
      />

      <Stack spacing={3} sx={{ maxWidth: 760 }}>
        <Card sx={{ p: 3 }} component="form" onSubmit={handleSave}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Legal and about
          </Typography>

          {!!loadError && (
            <Alert severity="warning" sx={{ mb: 2.5 }}>
              Could not load the current settings ({handleApiError(loadError)}). Saving will create
              them.
            </Alert>
          )}

          <Stack spacing={2.5}>
            {FIELDS.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                multiline
                minRows={3}
                label={field.label}
                value={values[field.name] ?? ''}
                onChange={handleChange(field.name)}
              />
            ))}

            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" disabled={saving || loading}>
                {saving ? 'Saving...' : values.id ? 'Save settings' : 'Create settings'}
              </Button>
              <Button color="inherit" onClick={() => setValues(loaded)} disabled={saving}>
                Reset form
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      {toastNode}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function Row({ label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Typography sx={{ width: 180, flexShrink: 0, fontSize: 14, color: 'text.secondary' }}>
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography sx={{ fontSize: 14, wordBreak: 'break-all' }}>{value}</Typography>
      ) : (
        value
      )}
    </Box>
  );
}

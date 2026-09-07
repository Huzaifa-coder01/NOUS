import { toast } from 'src/components/snackbar';

import { DocButton, EmptyState } from '../styles';

// ----------------------------------------------------------------------

/**
 * What a student sees when the API call behind a screen fails - a network
 * blip, the backend being down, or a 500. Anything role-related has already
 * been turned into a redirect by the guards.
 */
export function ScreenError({ error, onRetry }) {
  return (
    <EmptyState>
      <strong>This did not load</strong>
      {error?.message ?? 'Something went wrong'}

      {!!onRetry && (
        <div style={{ marginTop: 18 }}>
          <DocButton
            type="button"
            variant="primary"
            onClick={() => {
              onRetry();
              toast.message('Retrying...');
            }}
          >
            Try again
          </DocButton>
        </div>
      )}
    </EmptyState>
  );
}

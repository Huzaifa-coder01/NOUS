import { toast } from 'src/components/snackbar';

import { DocButton, EmptyState } from '../styles';

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

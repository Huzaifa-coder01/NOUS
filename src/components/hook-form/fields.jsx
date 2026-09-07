import { RHFTextField } from './rhf-text-field';

// ----------------------------------------------------------------------

/**
 * Only the field types NOUS actually uses. The original template shipped
 * editor / upload / phone / country / date variants too - add them back here
 * (they live in git history) if a form ever needs them.
 */
export const Field = {
  Text: RHFTextField,
};

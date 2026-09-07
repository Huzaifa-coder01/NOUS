import { useNavigate } from 'react-router-dom';

import { BackButtonRoot } from '../styles';

// ----------------------------------------------------------------------

export function BackButton({ href }) {
  const navigate = useNavigate();

  return (
    <BackButtonRoot type="button" onClick={() => navigate(href)}>
      ← Back
    </BackButtonRoot>
  );
}

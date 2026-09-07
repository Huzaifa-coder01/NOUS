import { PageTitleRoot } from '../styles';

// ----------------------------------------------------------------------

export function PageTitle({ title, subtitle }) {
  return (
    <PageTitleRoot>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </PageTitleRoot>
  );
}

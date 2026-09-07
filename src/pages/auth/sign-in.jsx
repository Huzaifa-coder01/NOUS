import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtSignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `Sign in - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtSignInView />
    </>
  );
}

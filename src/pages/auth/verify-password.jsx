import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtVerifyPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `Verify code - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtVerifyPasswordView />
    </>
  );
}

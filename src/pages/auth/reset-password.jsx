import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtResetPasswordView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `Reset password - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtResetPasswordView />
    </>
  );
}

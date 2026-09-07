import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtSignUpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

const metadata = { title: `Sign up - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtSignUpView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AdminAllNodesView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Chapters - Admin - ${CONFIG.site.name}`}</title>
      </Helmet>

      <AdminAllNodesView type="chapter" />
    </>
  );
}

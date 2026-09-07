import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AdminCatalogView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Courses - Admin - ${CONFIG.site.name}`}</title>
      </Helmet>

      <AdminCatalogView />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AdminAllDocsView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Past papers - Admin - ${CONFIG.site.name}`}</title>
      </Helmet>

      <AdminAllDocsView
        kind="past-paper"
        heading="Past papers"
        subheading="Every past paper in the system. Add new ones from the subject or chapter they belong to."
      />
    </>
  );
}

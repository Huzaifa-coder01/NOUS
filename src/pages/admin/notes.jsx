import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AdminAllDocsView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Student notes - Admin - ${CONFIG.site.name}`}</title>
      </Helmet>

      <AdminAllDocsView
        kind="note"
        heading="Student notes"
        subheading="Notes uploaded by students, with the course, level, subject and chapter each one belongs to."
      />
    </>
  );
}

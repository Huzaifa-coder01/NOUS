import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AdminAllDocsView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Syllabus - Admin - ${CONFIG.site.name}`}</title>
      </Helmet>

      <AdminAllDocsView
        kind="syllabus"
        heading="Syllabus"
        subheading="Every syllabus PDF in the system. Add new ones from the chapter they belong to."
      />
    </>
  );
}

import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { idOf, STATUS, contentCount, CHAPTER_SECTIONS } from 'src/constants/nous';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { AdminPageHeader } from '../components/admin-page-header';

// ----------------------------------------------------------------------

/**
 * A chapter is a container for its three document sections, so this page is a
 * hub. The counts come from the chapter row's `contentCount`, which the
 * chapters API fills in for exactly this screen.
 */
export function AdminChapterView({ course, level, subject, chapter }) {
  const navigate = useNavigate();

  const ids = [idOf(course), idOf(level), idOf(subject), idOf(chapter)];

  return (
    <DashboardContent>
      <AdminPageHeader
        title={`Chapter ${chapter.chapterNumber} - ${chapter.name}`}
        subtitle="Everything a student sees inside this chapter"
        links={[
          { name: 'Catalog', href: paths.admin.catalog.root },
          { name: course.name, href: paths.admin.catalog.course(idOf(course)) },
          { name: level.name, href: paths.admin.catalog.level(idOf(course), idOf(level)) },
          {
            name: subject.name,
            href: paths.admin.catalog.subject(idOf(course), idOf(level), idOf(subject)),
          },
          { name: chapter.name },
        ]}
      />

      {chapter.status !== STATUS.active && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This chapter is {chapter.status}, so none of the PDFs below reach students - whatever
          their own status. Switch the chapter back on from the chapter list.
        </Alert>
      )}

      <Stack spacing={2.5}>
        {CHAPTER_SECTIONS.map((section) => {
          const count = contentCount(chapter, section.count);

          return (
            <Card key={section.id} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Box sx={{ fontSize: 30 }}>{section.icon}</Box>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="h6">{section.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {section.kind === 'note'
                      ? 'Uploaded by students - you can rename, deactivate or delete them'
                      : section.description}
                  </Typography>
                </Box>

                <Label color={count ? 'success' : 'default'}>{count} active</Label>

                <Button
                  variant="contained"
                  startIcon={<Iconify icon="solar:folder-with-files-bold" />}
                  onClick={() => navigate(paths.admin.catalog.chapterSection(...ids, section.id))}
                >
                  Manage
                </Button>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </DashboardContent>
  );
}

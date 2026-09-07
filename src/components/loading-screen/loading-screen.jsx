import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

export function LoadingScreen({ sx }) {
  return (
    <Box
      sx={{
        px: 5,
        py: 10,
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}

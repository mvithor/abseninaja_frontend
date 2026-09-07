import { Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import PenempatanPklPanel from 'src/apps/kepala-jurusan/penempatan-pkl/PenempatanPklPanel';
import { T } from 'src/components/dashboard-kepala-jurusan/pkl/PklPlacementConfig';

const PenempatanPKL = () => {
  return (
    <PageContainer title="Penempatan PKL" description="PKL Placement Engine – Kepala Jurusan">
      <Box
        sx={{
          backgroundColor: T.bgPage,
          mx: { xs: -2, sm: '-24px' },
          mt: { xs: -2, sm: '-24px' },
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 4 },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: 'auto' }}>
          <PenempatanPklPanel />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default PenempatanPKL;
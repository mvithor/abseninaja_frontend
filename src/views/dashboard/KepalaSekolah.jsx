import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const DashboardKepalaSekolah = () => {
  const user = useSelector((state) => state.user);

  return (
    <PageContainer title="Dashboard Kepala Sekolah" description="Dashboard Kepala Sekolah">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Kepala Sekolah'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ringkasan sekolah untuk Kepala Sekolah akan tersedia di sini.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default DashboardKepalaSekolah;

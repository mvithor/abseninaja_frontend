import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const DashboardGuruSekolah = () => {
  const user = useSelector((state) => state.user);

  return (
    <PageContainer title="Dashboard Guru Sekolah" description="Dashboard Guru Sekolah">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Guru Sekolah'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Profil Anda akan tersedia di sini.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default DashboardGuruSekolah;
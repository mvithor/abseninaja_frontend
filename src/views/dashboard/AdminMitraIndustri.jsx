import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const DashboardAdminMitraIndustri = () => {
  const user = useSelector((state) => state.user);

  return (
    <PageContainer title="Dashboard Mitra Industri" description="Dashboard Admin Mitra Industri">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Mitra Industri'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Profil industri Anda akan tersedia di sini.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default DashboardAdminMitraIndustri;
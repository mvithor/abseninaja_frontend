import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const DashboardGuruBk = () => {
  const user = useSelector((state) => state.user);

  return (
    <PageContainer title="Dashboard Guru BK" description="Dashboard Guru BK">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Guru BK'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fitur Bimbingan dan Konseling akan tersedia di sini.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default DashboardGuruBk;

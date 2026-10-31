import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const DashboardWakaKurikulum = () => {
  const user = useSelector((state) => state.user);

  return (
    <PageContainer title="Dashboard Waka Kurikulum" description="Dashboard Waka Kurikulum">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Waka Kurikulum'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fitur Waka Kurikulum akan tersedia di sini.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default DashboardWakaKurikulum;

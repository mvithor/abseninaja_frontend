import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const DashboardAdminKantin = () => {
  const user = useSelector((state) => state.user);

  return (
    <PageContainer title="Dashboard Admin Kantin" description="Dashboard Admin Kantin">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Admin Kantin'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fitur kantin akan tersedia di sini.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default DashboardAdminKantin;

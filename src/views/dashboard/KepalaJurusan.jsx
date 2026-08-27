import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import PageContainer from 'src/components/container/PageContainer';

const KepalaJurusan = () => {
  const user = useSelector((state) => state.user);

  return (
    <PageContainer title="Dashboard Kepala Jurusan" description="Dashboard Kepala Jurusan">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Selamat datang, {user?.name || 'Kepala Jurusan'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Menu Mitra Industri dan SGA akan tersedia di sini.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default KepalaJurusan;
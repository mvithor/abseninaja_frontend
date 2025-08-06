import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ErrorImg from 'src/assets/images/backgrounds/errorimg.svg';

const Error = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.user);

  // Menentukan rute kembali berdasarkan peran pengguna
  const getRedirectPath = () => {
    switch (role) {
      case 'super admin':
        return '/dashboard/super-admin'; // Ganti dengan rute dashboard admin yang sesuai
      case 'admin sekolah':
        return '/dashboard/admin-sekolah'; // Ganti dengan rute dashboard siswa yang sesuai
      default:
        return '/'; // Rute default jika peran tidak dikenali
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      textAlign="center"
      justifyContent="center"
    >
      <Container maxWidth="md">
        <img src={ErrorImg} alt="404" />
        <Typography align="center" variant="h1" mb={4}>
          Opps!!!
        </Typography>
        <Typography align="center" variant="h4" mb={4}>
          Halaman yang Anda cari tidak dapat ditemukan.
        </Typography>
        <Button
          color="primary"
          variant="contained"
          onClick={() => navigate(getRedirectPath())}
          style={{ color: 'white' }}
          disableElevation
          sx={{
            backgroundColor: '#F48C06',
            '&:hover': {
              backgroundColor: '#2F327D',
            },
          }}
        >
          Kembali ke Halaman Utama
        </Button>
      </Container>
    </Box>
  );
};

export default Error;

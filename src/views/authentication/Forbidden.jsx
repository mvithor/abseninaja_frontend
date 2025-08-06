import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import ErrorImg from 'src/assets/images/backgrounds/forbidden.svg';

const Forbidden = () => {
    const navigate = useNavigate();
    const { role } = useSelector((state) => state.user);

    // Menentukan path redirect berdasarkan role pengguna
    const getRedirectPath = () => {
        switch (role) {
            case 'super admin':
                return '/dashboard/admin';
            case 'admin sekolah':
                return '/dashboard/admin-sekolah';
            default:
                return '/';
        }
    };

    // Menentukan pesan Forbidden berdasarkan role pengguna
    const getMessage = () => {
        switch (role) {
            case 'super admin':
                return 'Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke dashboard admin.';
            case 'admin sekolah':
                return 'Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke dashboard siswa.';
            default:
                return 'Anda tidak memiliki izin untuk mengakses halaman ini.';
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
                <img src={ErrorImg} alt="403 Forbidden" />
                <Typography align="center" variant="h1" mb={4}>
                    Oops!!!
                </Typography>
                <Typography align="center" variant="h4" mb={4}>
                    {getMessage()}
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

export default Forbidden;

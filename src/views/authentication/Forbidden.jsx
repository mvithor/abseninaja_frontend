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
                return '/dashboard/super-admin';
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
                return 'Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke dashboard admin sekolah';
            default:
                return 'Anda tidak memiliki izin untuk mengakses halaman ini.';
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            minHeight="100vh"
            textAlign="center"
            justifyContent="center"
            sx={{
                px: { xs: 2, sm: 3 },
                py: { xs: 4, sm: 0 },
            }}
        >
            <Container maxWidth="md">
                <Box
                    component="img"
                    src={ErrorImg}
                    alt="403 Forbidden"
                    sx={{
                        width: { xs: '70%', sm: '55%', md: '400px' },
                        maxWidth: '100%',
                        height: 'auto',
                        mx: 'auto',
                        mb: { xs: 2, sm: 3 },
                    }}
                />
                <Typography
                    align="center"
                    mb={{ xs: 2, sm: 4 }}
                    sx={{
                        fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                        fontWeight: 700,
                        lineHeight: 1.2,
                    }}
                >
                    Oops!!!
                </Typography>
                <Typography
                    align="center"
                    mb={4}
                    sx={{
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                        px: { xs: 1, sm: 0 },
                    }}
                >
                    {getMessage()}
                </Typography>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => navigate(getRedirectPath())}
                    disableElevation
                    fullWidth
                    sx={{
                        color: 'white',
                        backgroundColor: '#F48C06',
                        maxWidth: { xs: '100%', sm: 320 },
                        py: { xs: 1.25, sm: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
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

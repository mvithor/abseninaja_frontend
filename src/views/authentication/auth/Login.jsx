import Grid from '@mui/material/Grid';
import { Box, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import img1 from 'src/assets/images/backgrounds/loginbg.svg';
import Logo from 'src/layouts/full/shared/logo/Logo';
import AuthLogin from '../authForms/AuthLogin';

const Login = () => (
  <PageContainer title="Login" description="this is Login page" showHeader={false}>
    <Grid container spacing={0} columns={12} sx={{ overflowX: 'hidden' }}>
      {/* Gambar Background */}
      <Grid size={{ xs: 12, lg: 7, xl: 8 }} sx={{
        position: 'relative',
        '&:before': {
          content: '""',
          background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
          position: 'absolute',
          height: '100%',
          width: '100%',
          opacity: 0.3,
        },
      }}>
        <Box position="relative">
          <Box px={3} />
          <Box alignItems="center" justifyContent="center" height="calc(100vh - 75px)" sx={{
            display: { xs: 'none', lg: 'flex' },
          }}>
            <img src={img1} alt="bg" style={{ width: '100%', maxWidth: '500px' }} />
          </Box>
        </Box>
      </Grid>

      {/* Form Login */}
      <Grid size={{ xs: 12, lg: 5, xl: 4 }} sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        height: '100vh',
      }}>
        <Box p={4}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Logo />
          </Box>
          <AuthLogin
            title="Sistem Manajemen Absensi Online QR-Code"
            subtext={
              <Typography variant="subtitle1" sx={{ color: 'textPrimary', mb: 1 }}>
                Solusi Terintegrasi untuk Absensi dan Manajemen Akademik Sekolah
              </Typography>
            }
          />
        </Box>
      </Grid>
    </Grid>
  </PageContainer>
);

export default Login;

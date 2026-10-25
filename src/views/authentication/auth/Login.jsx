import { useState } from 'react';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Grid, Stack, Typography, Link, useTheme, alpha } from '@mui/material';
import { IconCircleCheck, IconArrowLeft } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import logoLight from 'src/assets/images/logos/light-logo.svg';
import logoDark from 'src/assets/images/logos/dark-logo.svg';
import AuthLogin from '../authForms/AuthLogin';
import { getDefaultPortal } from 'src/portals/registry';
import isTokenExpired from 'src/utils/isTokenExpired';

const highlights = [
  'Absensi digital real-time via QR Code',
  'Manajemen akademik terpadu dalam satu tempat',
  'Laporan dan rekap kehadiran otomatis',
];

const Login = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const user = useSelector((state) => state.user);
  const location = useLocation();

  // Pengguna yang SUDAH login tidak perlu melihat form lagi: arahkan ke portalnya.
  // Dihitung SEKALI saat halaman dibuka (initializer useState), bukan reaktif, supaya
  // pesan "Login berhasil! Mengarahkan..." di AuthLogin tampil penuh, dan alur
  // ?expired=true (yang membersihkan sesi di AuthLogin) tidak berputar balik ke dashboard.
  const [redirectPath] = useState(() => {
    if (new URLSearchParams(location.search).get('expired')) return null;
    if (isTokenExpired(user?.accessToken)) return null;
    return getDefaultPortal(user)?.path || null;
  });

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <PageContainer title="Masuk | Absenin Aja" description="Masuk ke akun Absenin Aja Anda">
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(primary, 0.12)} 0%, #eef2ff 45%, ${alpha(
            secondary,
            0.14,
          )} 100%)`,
        }}
      >
        {/* Blob berwarna yang di-blur untuk menyamarkan batas putih & biru */}
        <Box
          sx={{
            position: 'absolute',
            top: '-12%',
            left: '-8%',
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: alpha(primary, 0.55),
            filter: 'blur(130px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-18%',
            right: '-6%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: alpha(secondary, 0.45),
            filter: 'blur(150px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '35%',
            right: '30%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: alpha('#38A1FF', 0.35),
            filter: 'blur(140px)',
          }}
        />

        {/* Kartu autentikasi (glassmorphism) */}
        <Grid
          container
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 1080,
            minHeight: { md: 620 },
            borderRadius: 5,
            overflow: 'hidden',
            border: `1px solid ${alpha('#ffffff', 0.6)}`,
            boxShadow: `0 40px 80px -30px ${alpha(primary, 0.45)}`,
            backdropFilter: 'blur(22px)',
            backgroundColor: alpha('#ffffff', 0.55),
          }}
        >
          {/* ===== Panel brand (kiri) ===== */}
          <Grid
            size={{ xs: 12, md: 6, lg: 7 }}
            sx={{
              position: 'relative',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: { md: 5, lg: 7 },
              color: '#fff',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(primary, 0.92)} 0%, ${alpha(
                secondary,
                0.92,
              )} 100%)`,
            }}
          >
            {/* Ornamen kaca di dalam panel */}
            <Box
              sx={{
                position: 'absolute',
                top: -110,
                right: -110,
                width: 320,
                height: 320,
                borderRadius: '50%',
                background: alpha('#ffffff', 0.14),
                filter: 'blur(6px)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -130,
                left: -70,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: alpha('#ffffff', 0.1),
                filter: 'blur(6px)',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <img src={logoLight} alt="Absenin Aja" style={{ height: 34 }} />
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 460 }}>
              <Typography
                variant="h2"
                sx={{ fontWeight: 700, fontSize: { md: 32, lg: 40 }, lineHeight: 1.2, mb: 2 }}
              >
                Kelola sekolah Anda dengan lebih mudah
              </Typography>
              <Typography sx={{ opacity: 0.9, fontSize: 16, lineHeight: 1.7, mb: 4 }}>
                Satu platform untuk absensi digital, manajemen akademik, hingga penempatan PKL.
              </Typography>
              <Stack spacing={2}>
                {highlights.map((item) => (
                  <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                    <IconCircleCheck size={22} />
                    <Typography sx={{ opacity: 0.95 }}>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Typography sx={{ position: 'relative', zIndex: 1, opacity: 0.75, fontSize: 13 }}>
              © {new Date().getFullYear()} Absenin Aja. Seluruh hak cipta dilindungi.
            </Typography>
          </Grid>

          {/* ===== Panel form (kanan, kaca frosted) ===== */}
          <Grid
            size={{ xs: 12, md: 6, lg: 5 }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 3, sm: 6 },
              backgroundColor: alpha('#ffffff', 0.7),
              backdropFilter: 'blur(18px)',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 400 }}>
              <Link
                component={RouterLink}
                to="/"
                underline="none"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 4,
                  fontSize: 14,
                  color: 'text.secondary',
                  '&:hover': { color: primary },
                }}
              >
                <IconArrowLeft size={16} /> Kembali ke beranda
              </Link>

              {/* Logo untuk layar kecil */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
                <img src={logoDark} alt="Absenin Aja" style={{ height: 30 }} />
              </Box>

              <AuthLogin
                title="Selamat datang kembali"
                subtext="Masuk ke akun Anda untuk melanjutkan ke dashboard Absenin Aja."
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login;
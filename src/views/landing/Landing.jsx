import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  Divider,
  Link,
  useTheme,
  alpha,
} from '@mui/material';
import {
  IconQrcode,
  IconSchool,
  IconReportAnalytics,
  IconBriefcase,
  IconUsers,
  IconShieldCheck,
  IconArrowRight,
  IconBrandWhatsapp,
  IconMail,
  IconMenu2,
  IconX,
  IconDeviceDesktop,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import logoDark from 'src/assets/images/logos/dark-logo.svg';

// GANTI dengan kontak resmi Absenin Aja sebelum tayang.
const CONTACT = {
  whatsappNumber: '6281234567890', // format internasional tanpa tanda +
  whatsappDisplay: '0812-3456-7890',
  email: 'halo@abseninaja.com',
};

const WA_LINK = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(
  'Halo Absenin Aja, saya ingin tahu lebih lanjut tentang platform sekolah Anda.',
)}`;

const navLinks = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Peran', href: '#peran' },
  { label: 'Kontak', href: '#kontak' },
];

const features = [
  {
    icon: IconQrcode,
    title: 'Absensi Digital',
    desc: 'Presensi siswa dan pegawai lewat QR Code secara real-time, akurat, dan bebas titip absen.',
  },
  {
    icon: IconSchool,
    title: 'Manajemen Akademik',
    desc: 'Kelola data siswa, guru, kelas, jurusan, dan ekstrakurikuler dalam satu tempat.',
  },
  {
    icon: IconReportAnalytics,
    title: 'Laporan & Rekap',
    desc: 'Pantau kehadiran dan aktivitas sekolah lewat dashboard dan rekap otomatis.',
  },
  {
    icon: IconBriefcase,
    title: 'Penempatan PKL',
    desc: 'Bantu Kepala Jurusan menempatkan siswa PKL berbasis profil kesiapan kerja.',
  },
  {
    icon: IconUsers,
    title: 'Multi Peran',
    desc: 'Akses berjenjang untuk super admin, admin sekolah, kepala jurusan, hingga mitra industri.',
  },
  {
    icon: IconShieldCheck,
    title: 'Aman & Terpercaya',
    desc: 'Data sekolah tersimpan aman dengan kontrol akses sesuai peran masing-masing pengguna.',
  },
];

const audiences = [
  { title: 'Admin Sekolah', desc: 'Mengelola data pokok, absensi, perizinan, dan kegiatan sekolah harian.' },
  { title: 'Kepala Jurusan', desc: 'Memetakan kompetensi SKKNI, mitra industri, dan penempatan PKL siswa.' },
  { title: 'Mitra Industri', desc: 'Memantau siswa PKL dan berkolaborasi dengan sekolah secara transparan.' },
];

const footerGroups = [
  {
    title: 'Produk',
    links: [
      { label: 'Fitur', href: '#fitur' },
      { label: 'Peran', href: '#peran' },
      { label: 'Kontak', href: '#kontak' },
    ],
  },
  {
    title: 'Akun',
    links: [{ label: 'Masuk', to: '/login' }],
  },
  {
    title: 'Legal',
    links: [{ label: 'Kebijakan Privasi', to: '/privacy-policy' }],
  },
];

export default function Landing() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <PageContainer
      title="Absenin Aja | Tata Kelola & Absensi Sekolah"
      description="Solusi terintegrasi untuk absensi digital dan manajemen akademik sekolah."
    >
      <Box sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        {/* ===== Navbar ===== */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(8px)',
            bgcolor: alpha('#ffffff', 0.85),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="lg">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ height: 72 }}
            >
              <Box component={RouterLink} to="/" sx={{ display: 'flex' }}>
                <img src={logoDark} alt="Absenin Aja" style={{ height: 30 }} />
              </Box>

              {/* Nav links (desktop) */}
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    underline="none"
                    sx={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'text.secondary',
                      '&:hover': { color: primary },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>

              {/* Actions (desktop) */}
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                <Button
                  component="a"
                  href={WA_LINK}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  startIcon={<IconBrandWhatsapp size={18} />}
                  sx={{ borderRadius: 999, px: 2.5 }}
                >
                  WhatsApp
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  disableElevation
                  sx={{ borderRadius: 999, px: 3 }}
                >
                  Masuk
                </Button>
              </Stack>

              {/* Hamburger (mobile) */}
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                aria-label="Buka menu"
              >
                <IconMenu2 />
              </IconButton>
            </Stack>
          </Container>
        </Box>

        {/* Mobile drawer */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={closeMobile}
          PaperProps={{ sx: { width: 280, p: 2 } }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <img src={logoDark} alt="Absenin Aja" style={{ height: 26 }} />
            <IconButton onClick={closeMobile} aria-label="Tutup menu">
              <IconX />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <List>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.href}
                component="a"
                href={link.href}
                onClick={closeMobile}
                sx={{ borderRadius: 2 }}
              >
                <Typography sx={{ fontWeight: 500 }}>{link.label}</Typography>
              </ListItemButton>
            ))}
          </List>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            <Button
              component="a"
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              variant="outlined"
              startIcon={<IconBrandWhatsapp size={18} />}
              sx={{ borderRadius: 999 }}
            >
              WhatsApp
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              disableElevation
              onClick={closeMobile}
              sx={{ borderRadius: 999 }}
            >
              Masuk
            </Button>
          </Stack>
        </Drawer>

        {/* ===== Hero ===== */}
        <Box
          sx={{
            background: `linear-gradient(180deg, ${alpha(primary, 0.06)} 0%, ${alpha(
              primary,
              0,
            )} 100%)`,
          }}
        >
          <Container maxWidth="lg" sx={{ pt: { xs: 7, md: 11 }, pb: { xs: 6, md: 9 } }}>
            <Stack spacing={3} alignItems="center" textAlign="center" sx={{ maxWidth: 760, mx: 'auto' }}>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 0.5,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  color: primary,
                  bgcolor: alpha(primary, 0.1),
                }}
              >
                Platform Sekolah Terintegrasi
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.15,
                  fontSize: { xs: 34, sm: 44, md: 54 },
                  letterSpacing: '-0.02em',
                }}
              >
                Absensi & tata kelola sekolah, cukup{' '}
                <Box component="span" sx={{ color: primary }}>
                  Absenin Aja
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 16, md: 18 },
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  maxWidth: 620,
                }}
              >
                Satu platform untuk absensi digital, manajemen akademik, hingga penempatan PKL.
                Membantu sekolah bekerja lebih rapi, cepat, dan berbasis data.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  size="large"
                  disableElevation
                  endIcon={<IconArrowRight size={18} />}
                  sx={{ borderRadius: 999, px: 4 }}
                >
                  Mulai Sekarang
                </Button>
                <Button
                  component="a"
                  href={WA_LINK}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  size="large"
                  startIcon={<IconBrandWhatsapp size={18} />}
                  sx={{ borderRadius: 999, px: 4 }}
                >
                  Hubungi via WhatsApp
                </Button>
              </Stack>
            </Stack>

            {/* Placeholder mockup sistem — isi dengan screenshot dashboard nanti */}
            <Box
              sx={{
                mt: { xs: 6, md: 8 },
                mx: 'auto',
                maxWidth: 960,
                borderRadius: 4,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 30px 60px -30px ${alpha(primary, 0.35)}`,
                bgcolor: '#fff',
              }}
            >
              {/* Bar jendela ala browser */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(primary, 0.03) }}
              >
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FEBC2E' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28C840' }} />
              </Stack>
              {/* Area kosong untuk mockup */}
              <Box
                sx={{
                  aspectRatio: '16 / 9',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  color: 'text.disabled',
                  background: `repeating-linear-gradient(45deg, ${alpha(
                    primary,
                    0.02,
                  )}, ${alpha(primary, 0.02)} 12px, ${alpha(primary, 0.05)} 12px, ${alpha(
                    primary,
                    0.05,
                  )} 24px)`,
                }}
              >
                <IconDeviceDesktop size={44} stroke={1.4} />
                <Typography sx={{ fontWeight: 500 }}>Mockup sistem akan ditampilkan di sini</Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ===== Fitur ===== */}
        <Container id="fitur" maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
          <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: 28, md: 36 } }}>
              Semua kebutuhan sekolah dalam satu aplikasi
            </Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 560 }}>
              Dirancang untuk menyederhanakan pekerjaan administrasi harian sekolah menengah kejuruan.
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      transition: 'all .2s ease',
                      '&:hover': {
                        borderColor: primary,
                        boxShadow: `0 18px 40px -18px ${alpha(primary, 0.35)}`,
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: primary,
                          bgcolor: alpha(primary, 0.1),
                          mb: 2,
                        }}
                      >
                        <Icon size={26} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.65 }}>
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>

        {/* ===== Peran ===== */}
        <Box id="peran" sx={{ bgcolor: alpha(primary, 0.04), scrollMarginTop: 80 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
            <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
              <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: 28, md: 36 } }}>
                Dibuat untuk setiap peran di sekolah
              </Typography>
              <Typography sx={{ color: 'text.secondary', maxWidth: 560 }}>
                Setiap pengguna mendapatkan akses dan tampilan yang sesuai dengan tugasnya.
              </Typography>
            </Stack>
            <Grid container spacing={3}>
              {audiences.map((a, i) => (
                <Grid key={a.title} size={{ xs: 12, md: 4 }}>
                  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 'none' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        sx={{ fontWeight: 700, fontSize: 40, color: alpha(primary, 0.25), mb: 1 }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {a.title}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.65 }}>
                        {a.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ===== Kontak ===== */}
        <Container id="kontak" maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: 28, md: 36 }, mb: 2 }}>
                Punya pertanyaan? Mari bicara.
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4, maxWidth: 480 }}>
                Tim kami siap membantu sekolah Anda memulai. Hubungi kami lewat WhatsApp atau email,
                dan kami akan merespons secepatnya.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component="a"
                  href={WA_LINK}
                  target="_blank"
                  rel="noreferrer"
                  variant="contained"
                  size="large"
                  disableElevation
                  startIcon={<IconBrandWhatsapp size={18} />}
                  sx={{ borderRadius: 999, px: 3 }}
                >
                  Chat WhatsApp
                </Button>
                <Button
                  component="a"
                  href={`mailto:${CONTACT.email}`}
                  variant="outlined"
                  size="large"
                  startIcon={<IconMail size={18} />}
                  sx={{ borderRadius: 999, px: 3 }}
                >
                  Kirim Email
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: primary,
                          bgcolor: alpha(primary, 0.1),
                        }}
                      >
                        <IconBrandWhatsapp size={24} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>WhatsApp</Typography>
                        <Link
                          href={WA_LINK}
                          target="_blank"
                          rel="noreferrer"
                          underline="hover"
                          sx={{ fontWeight: 600, color: 'text.primary' }}
                        >
                          {CONTACT.whatsappDisplay}
                        </Link>
                      </Box>
                    </Stack>
                    <Divider />
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: primary,
                          bgcolor: alpha(primary, 0.1),
                        }}
                      >
                        <IconMail size={24} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Email</Typography>
                        <Link
                          href={`mailto:${CONTACT.email}`}
                          underline="hover"
                          sx={{ fontWeight: 600, color: 'text.primary' }}
                        >
                          {CONTACT.email}
                        </Link>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* ===== CTA ===== */}
        <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
          <Box
            sx={{
              borderRadius: 4,
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              color: '#fff',
              background: `linear-gradient(135deg, ${primary} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: 26, md: 34 }, mb: 2 }}>
              Siap merapikan tata kelola sekolah Anda?
            </Typography>
            <Typography sx={{ opacity: 0.9, maxWidth: 560, mx: 'auto', mb: 4 }}>
              Masuk ke akun Absenin Aja Anda dan mulai kelola absensi serta administrasi sekolah hari ini.
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              disableElevation
              sx={{
                borderRadius: 999,
                px: 5,
                bgcolor: '#fff',
                color: primary,
                '&:hover': { bgcolor: alpha('#ffffff', 0.9) },
              }}
            >
              Masuk ke Absenin Aja
            </Button>
          </Box>
        </Container>

        {/* ===== Footer ===== */}
        <Box component="footer" sx={{ borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(primary, 0.02) }}>
          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <img src={logoDark} alt="Absenin Aja" style={{ height: 28 }} />
                <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 2, maxWidth: 300, lineHeight: 1.7 }}>
                  Solusi terintegrasi untuk absensi digital dan manajemen akademik sekolah.
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <IconButton
                    component="a"
                    href={WA_LINK}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    sx={{ color: primary, bgcolor: alpha(primary, 0.1), '&:hover': { bgcolor: alpha(primary, 0.18) } }}
                  >
                    <IconBrandWhatsapp size={20} />
                  </IconButton>
                  <IconButton
                    component="a"
                    href={`mailto:${CONTACT.email}`}
                    aria-label="Email"
                    sx={{ color: primary, bgcolor: alpha(primary, 0.1), '&:hover': { bgcolor: alpha(primary, 0.18) } }}
                  >
                    <IconMail size={20} />
                  </IconButton>
                </Stack>
              </Grid>

              {footerGroups.map((group) => (
                <Grid key={group.title} size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>{group.title}</Typography>
                  <Stack spacing={1.2}>
                    {group.links.map((link) =>
                      link.to ? (
                        <Link
                          key={link.label}
                          component={RouterLink}
                          to={link.to}
                          underline="none"
                          sx={{ fontSize: 14, color: 'text.secondary', '&:hover': { color: primary } }}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <Link
                          key={link.label}
                          href={link.href}
                          underline="none"
                          sx={{ fontSize: 14, color: 'text.secondary', '&:hover': { color: primary } }}
                        >
                          {link.label}
                        </Link>
                      ),
                    )}
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 4 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'center' }}>
              © {new Date().getFullYear()} Absenin Aja. Seluruh hak cipta dilindungi.
            </Typography>
          </Container>
        </Box>
      </Box>
    </PageContainer>
  );
}

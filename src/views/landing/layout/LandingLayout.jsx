import { Outlet, useLocation } from 'react-router-dom';
import { Box, GlobalStyles, ThemeProvider, createTheme } from '@mui/material';
import { baselightTheme } from 'src/theme/DefaultColors';
import PromoBar from './PromoBar';
import Header from './Header';
import Footer from './Footer';
import BottomTabBar from './BottomTabBar';
import TombolKeAtas from './TombolKeAtas';
import { colors, font, gradients, layout } from '../theme/tokens';
import { cincinFokus, hanyaPembaca } from '../theme/sx';
import { footerDenganAfiliator } from './rute';

// Tema global aplikasi (src/theme/Components.jsx) memberi SETIAP Box aturan
// `.MuiBox-root { border-radius: theme.shape.borderRadius }` (7 px). Di landing
// itu membuat bar pengumuman, header, section lebar penuh, dan footer ikut
// membulat. Aturan di bawah dipasang hanya selama layout landing terpasang
// (GlobalStyles dilepas saat unmount) dan meniadakannya: Box tanpa borderRadius
// eksplisit menjadi persegi, termasuk Box di portal (lembar Lainnya).
// Jangan diberi !important atau selektor turunan: kartu, tombol, tag, dan kotak
// ikon yang menulis borderRadius lewat sx harus tetap membulat. Itu aman karena
// emotion menyisipkan gaya global sebelum gaya komponen (sx), dan spesifisitas
// keduanya sama (satu kelas), jadi sx menang.
const gayaGlobalLanding = { '.MuiBox-root': { borderRadius: 0 } };

// Tema landing: selalu terang, diturunkan dari palet terang aplikasi
// (src/theme/DefaultColors.jsx). Dibuat sekali di tingkat modul dan tidak
// mengikuti mode gelap aplikasi (desain landing hanya terang). Komponen MUI
// bawaan aplikasi (src/theme/Components.jsx) sengaja tidak ikut dibawa.
const temaLanding = createTheme({
  palette: {
    ...baselightTheme.palette,
    mode: 'light',
    primary: { ...baselightTheme.palette.primary, main: colors.brand, dark: colors.brandHover },
    secondary: { ...baselightTheme.palette.secondary, main: colors.brandDark },
    text: { primary: colors.ink, secondary: colors.body },
    background: { default: colors.white, paper: colors.white },
    divider: colors.border,
  },
  typography: {
    fontFamily: font.family,
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

// Layout rute landing: Poppins dimuat hanya di sini (bukan index.html, supaya
// seluruh aplikasi tidak terpengaruh), mode terang dipaksa, lalu menyusun
// PromoBar, Header, konten, Footer, TombolKeAtas, dan bar tab bawah (< md).
// Footer berkartu afiliator di semua halaman dalam, tanpa kartu di Beranda
// (aturan per rute di layout/rute.js).
export default function LandingLayout() {
  const { pathname } = useLocation();
  return (
    <ThemeProvider theme={temaLanding}>
      <GlobalStyles styles={gayaGlobalLanding} />
      {/* React 19 mengangkat link ini ke <head> otomatis; precedence membuat render menunggu CSS font dimuat. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={font.href} precedence="default" />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: colors.white,
          color: colors.body,
          fontFamily: font.family,
          WebkitFontSmoothing: 'antialiased',
          overflowX: 'clip',
          // Fokus terlihat di seluruh landing.
          '& :focus-visible': cincinFokus,
          // Hormati prefers-reduced-motion: matikan animasi dan transisi.
          '@media (prefers-reduced-motion: reduce)': {
            '& *, & *::before, & *::after': {
              animation: 'none !important',
              transition: 'none !important',
              scrollBehavior: 'auto !important',
            },
          },
        }}
      >
        <Box
          component="a"
          href="#konten"
          sx={{
            ...hanyaPembaca,
            '&:focus': {
              position: 'fixed',
              top: '8px',
              left: '8px',
              zIndex: layout.zBarTab + 1,
              width: 'auto',
              height: 'auto',
              margin: 0,
              clip: 'auto',
              overflow: 'visible',
              padding: '12px 16px',
              borderRadius: '12px',
              background: colors.white,
              color: colors.accent,
              fontWeight: 600,
              textDecoration: 'none',
            },
          }}
        >
          Lewati ke konten
        </Box>
        <PromoBar />
        <Header />
        <Box component="main" id="konten" tabIndex={-1} sx={{ flex: '1 0 auto', '&#konten:focus-visible': { outline: 'none' } }}>
          <Outlet />
        </Box>
        {/* Padding bawah di seluler: footer tidak tertutup bar tab. */}
        <Box sx={{ background: gradients.dark, pb: { xs: layout.tinggiBarTab, md: 0 } }}>
          <Footer tampilkanAfiliator={footerDenganAfiliator(pathname)} />
        </Box>
        <TombolKeAtas />
        <BottomTabBar />
      </Box>
    </ThemeProvider>
  );
}

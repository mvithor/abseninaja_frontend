import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { IconArrowUp } from '@tabler/icons-react';
import { colors, gerak, gradients, layout, radius, shadows } from '../theme/tokens';
import { resetTombol } from '../theme/sx';

// Tombol kembali ke atas. Muncul setelah gulir sekitar 400 px. Kanan bawah 28 px
// (seluler: 16 px dari kanan dan 16 px di atas bar tab bawah, yaitu 100 px dari
// tepi layar bila tanpa area aman). Gulir halus kecuali prefers-reduced-motion (behavior auto).
const AMBANG = 400;

export default function TombolKeAtas() {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    let tampilSekarang = window.scrollY > AMBANG;
    setTampil(tampilSekarang);
    const onScroll = () => {
      const baru = window.scrollY > AMBANG;
      if (baru !== tampilSekarang) {
        tampilSekarang = baru;
        setTampil(baru);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const keAtas = () => {
    const kurangiGerak = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: kurangiGerak ? 'auto' : 'smooth' });
    // Tombol ini disembunyikan begitu gulir kembali ke atas; pindahkan fokus ke
    // konten supaya tidak jatuh ke body.
    document.getElementById('konten')?.focus({ preventScroll: true });
  };

  return (
    <Box
      component="button"
      type="button"
      aria-label="Kembali ke atas"
      onClick={keAtas}
      tabIndex={tampil ? 0 : -1}
      sx={{
        ...resetTombol,
        position: 'fixed',
        zIndex: layout.zKeAtas,
        right: { xs: '16px', md: '28px' },
        bottom: { xs: `calc(${layout.tinggiBarTab} + 16px)`, md: '28px' },
        width: { xs: 44, md: 48 },
        height: { xs: 44, md: 48 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.tombolAtas,
        background: gradients.brand,
        color: colors.white,
        boxShadow: shadows.keAtas,
        opacity: tampil ? 1 : 0,
        visibility: tampil ? 'visible' : 'hidden',
        transform: tampil ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity ${gerak.sedang} ease, transform ${gerak.sedang} ease, visibility 0s linear ${tampil ? '0s' : gerak.sedang}`,
        '&:hover': { background: gradients.brandHover },
      }}
    >
      <IconArrowUp size={22} stroke={2.4} aria-hidden="true" />
    </Box>
  );
}

import { useState } from 'react';
import { Box } from '@mui/material';
import { IconBell, IconX } from '@tabler/icons-react';
import Teks from '../components/Teks';
import TautanNav from './TautanNav';
import { PROMO } from '../data/layout';
import { colors, gradients, layout } from '../theme/tokens';
import { resetTombol } from '../theme/sx';

// Bar promo di atas halaman. Bisa ditutup. Teks dua versi: web (kalimat
// lengkap) dan seluler (satu baris). Ikon lonceng, bukan titik. Tautan
// "Jadwalkan demo" hanya di web (di seluler Demo ada di bar tab bawah).
export default function PromoBar() {
  const [terbuka, setTerbuka] = useState(true);
  if (!terbuka) return null;

  // Pindahkan fokus ke konten sebelum bar dilepas, supaya fokus tidak jatuh ke body.
  const tutup = () => {
    document.getElementById('konten')?.focus({ preventScroll: true });
    setTerbuka(false);
  };

  return (
    <Box
      role="region"
      aria-label="Pengumuman"
      sx={{ background: gradients.dark, color: colors.white }}
    >
      <Box
        sx={{
          maxWidth: layout.lebarKonten,
          mx: 'auto',
          px: layout.padX,
          boxSizing: 'border-box',
          minHeight: layout.tinggiPromo,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', py: '6px', fontSize: '13px', minWidth: 0 }}>
          <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', color: colors.yellow, flex: 'none' }}>
            <IconBell size={16} stroke={2} />
          </Box>
          <Teks
            web={PROMO.web}
            seluler={PROMO.seluler}
            sx={{ minWidth: 0, whiteSpace: { xs: 'nowrap', md: 'normal' }, overflow: 'hidden', textOverflow: 'ellipsis' }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 'none' }}>
          <TautanNav
            butir={PROMO.aksi}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              alignItems: 'center',
              minHeight: layout.targetSentuh,
              fontSize: '13px',
              fontWeight: 600,
              color: colors.white,
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
            }}
            sxNonaktif={{ color: colors.onDark, opacity: 0.7 }}
          />
          <Box
            component="button"
            type="button"
            aria-label={PROMO.labelTutup}
            onClick={tutup}
            sx={{
              ...resetTombol,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              color: colors.onDark,
              '&:hover': { color: colors.white },
            }}
          >
            <IconX size={18} stroke={2} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

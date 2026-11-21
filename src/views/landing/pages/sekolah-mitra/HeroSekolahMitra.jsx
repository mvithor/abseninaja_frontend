import { Box } from '@mui/material';
import HeroHalaman from '../../components/HeroHalaman';
import KartuAngka from '../../components/KartuAngka';
import { renderTeks } from '../../components/renderTeks';
import { HERO } from '../../data/sekolahMitra';
import { resetDaftar } from '../../theme/sx';

// Hero Sekolah Mitra: judul dua warna, subjudul, dan empat kartu angka (satu
// kolom di seluler, dua di sm, empat di md). Angka berupa teks dengan labelnya.
export default function HeroSekolahMitra() {
  return (
    <HeroHalaman
      eyebrow={HERO.eyebrow}
      judul={HERO.judul}
      sub={renderTeks(HERO.sub)}
      maxJudul={860}
      maxSub={560}
      padBawah={{ xs: '32px', md: '64px' }}
    >
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: '14px',
          width: '100%',
          maxWidth: 960,
          mt: '20px',
        }}
      >
        {HERO.statistik.map((b) => (
          <li key={b.label}>
            <KartuAngka varian="terang" angka={b.angka} label={b.label} verifikasi={b.verifikasi} />
          </li>
        ))}
      </Box>
    </HeroHalaman>
  );
}

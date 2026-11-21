import { useId, useState } from 'react';
import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import BarTabGradasi from '../../components/BarTabGradasi';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { idTab } from '../../components/idTab';
import { renderTeks } from '../../components/renderTeks';
import { FITUR as D, KELOMPOK, MODUL } from '../../data/analitik';
import { gradients } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { sxJangkar, sxSubLad } from './gaya';

// Fitur: bar tab gradasi (Semua dan empat kelompok, dengan jumlah) menyaring
// dua belas kartu tanpa muat ulang. Pola tab sama dengan halaman Fitur (satu
// tabpanel, id panel selalu ada). Kartu: satu kolom di bawah md, tiga kolom
// dari md. Sasaran jangkar #fitur.
const TAB = KELOMPOK.map((k) => ({
  id: k.id,
  label: k.nama,
  jumlah: k.id === 'semua' ? MODUL.length : MODUL.filter((m) => m.kelompok === k.id).length,
}));

export default function FiturLad() {
  const dasar = useId();
  const [aktif, setAktif] = useState(KELOMPOK[0].id);
  const tampil = aktif === 'semua' ? MODUL : MODUL.filter((m) => m.kelompok === aktif);
  const idPanel = `${dasar}-panel`;

  return (
    <Seksi
      varian="terang"
      id={D.id}
      padAtas={{ xs: '36px', md: '72px' }}
      padBawah={{ xs: '40px', md: '80px' }}
      sx={{ background: gradients.hero, ...sxJangkar }}
      aria-labelledby="judul-fitur-lad"
    >
      <JudulSeksi
        eyebrow={D.eyebrow}
        judul={D.judul}
        sub={renderTeks(D.sub)}
        id="judul-fitur-lad"
        maxSub={520}
        sx={{ gap: '16px', mb: '36px', ...sxSubLad }}
      />
      <BarTabGradasi tab={TAB} aktif={aktif} onUbah={setAktif} label={D.labelTab} idDasar={dasar} idPanel={idPanel} />
      <Box role="tabpanel" id={idPanel} aria-labelledby={idTab(dasar, aktif)} tabIndex={0} sx={{ mt: '32px' }}>
        <Box
          component="ul"
          role="list"
          sx={{
            ...resetDaftar,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
            gap: '20px',
          }}
        >
          {tampil.map((m) => (
            <Box key={m.judul} component="li" sx={{ display: 'flex' }}>
              <KartuIkon
                tata="sebaris"
                ikon={m.ikon}
                judul={m.judul}
                deskripsi={renderTeks(m.deskripsi)}
                tag={m.tag}
                penanda={<PenandaVerifikasi verifikasi={m.verifikasi} />}
                sx={{ flex: 1, minWidth: 0 }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Seksi>
  );
}

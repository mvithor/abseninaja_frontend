import { Box } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import BarisFakta from '../../components/BarisFakta';
import KartuIkon from '../../components/KartuIkon';
import TombolLanding from '../../components/TombolLanding';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { propsAksi } from '../../data/aksi';
import { LENGKAP as D } from '../../data/paket';
import { resetDaftar } from '../../theme/sx';

const KISI_TIGA = { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' };

// "Paket lengkap": bagian gelap dengan kartu angka kaca, enam kartu modul kaca
// (ikon kuning; `chip` Segera pada fitur yang belum dipakai), dan tombol kuning.
// Tiga kolom di md ke atas, satu kolom di bawahnya. Tanpa angka harga. Bila hanya
// satu kartu angka (F8: dua angka contoh dihapus), kartu itu ditengahkan.
export default function PaketLengkap() {
  return (
    <PerbandinganGelap
      id={D.id}
      eyebrow={D.eyebrow}
      judul={D.judul}
      jarak="44px"
      maxJudul={720}
    >
      <BarisFakta
        butir={D.statistik}
        varian="angka"
        sx={{
          maxWidth: 'none',
          mt: 0,
          gap: '20px',
          gridTemplateColumns: KISI_TIGA,
          ...(D.statistik.length === 1 ? { gridTemplateColumns: 'minmax(0,1fr)', maxWidth: 360, mx: 'auto' } : null),
        }}
      />
      <Box
        component="ul"
        role="list"
        sx={{ ...resetDaftar, display: 'grid', gridTemplateColumns: KISI_TIGA, gap: '20px', mt: '44px' }}
      >
        {D.modul.map((m) => (
          <Box key={m.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              varian="kaca"
              ikon={m.ikon}
              judul={m.judul}
              deskripsi={m.deskripsi}
              chip={m.chip}
              verifikasi={m.verifikasi}
              ikonSx={{ width: 52, height: 52 }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', mt: '44px' }}>
        <TombolLanding
          varian="kuning"
          ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}
          {...propsAksi(D.aksi.rute)}
        >
          {D.aksi.label}
        </TombolLanding>
        <PenandaVerifikasi verifikasi={D.verifikasi} />
      </Box>
    </PerbandinganGelap>
  );
}

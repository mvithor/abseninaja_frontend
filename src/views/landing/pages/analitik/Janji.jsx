import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { JANJI as D } from '../../data/analitik';
import { flags } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';
import { JARAK_ISI, sxSubLad } from './gaya';

// Enam janji: kartu ikon (tiga kolom dari md). Ikon 56 px di semua lebar,
// sesuai desain seluler. Tiap janji adalah pernyataan perilaku produk yang
// bisa diperiksa guru di layar.
export default function Janji() {
  return (
    <Seksi varian="terang" aria-labelledby="judul-janji">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-janji" sx={sxSubLad} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
          gap: '20px',
          mt: JARAK_ISI,
        }}
      >
        {D.kartu.map((k) => (
          <Box key={k.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              ikon={k.ikon}
              judul={k.judul}
              deskripsi={renderTeks(k.deskripsi)}
              // KartuIkon membuat baris tag bila `penanda` ada; jangan teruskan elemen
              // kosong (penanda mati) supaya tidak ada ruang tambahan di dasar kartu.
              penanda={k.verifikasi && flags.tampilkanPenandaDesain ? <PenandaVerifikasi verifikasi={k.verifikasi} /> : undefined}
              ikonSx={{ width: 56, height: 56, borderRadius: { xs: '14px', md: '16px' } }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

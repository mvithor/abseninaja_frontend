import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import KartuSekolah from '../../components/KartuSekolah';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { DAFTAR as D } from '../../data/sekolahMitra';
import { resetDaftar } from '../../theme/sx';

// Daftar sekolah: bagian gelap dengan kisi dua belas kartu sekolah (satu kolom
// di seluler, dua di sm, tiga di md). Kotak ikon peraga, bukan logo sekolah.
export default function DaftarSekolah() {
  return (
    <PerbandinganGelap id={D.id} eyebrow={D.eyebrow} judul={D.judul} jarak="48px">
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(3, minmax(0,1fr))' },
          gap: '16px',
        }}
      >
        {D.butir.map((b) => (
          <li key={b.nama}>
            <KartuSekolah nama={b.nama} jenjang={b.jenjang} wilayah={b.wilayah} />
          </li>
        ))}
      </Box>
      <PenandaVerifikasi verifikasi={D.verifikasi} sx={{ mt: '16px' }} />
    </PerbandinganGelap>
  );
}

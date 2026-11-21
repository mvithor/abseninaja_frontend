import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuDokumen from '../../components/KartuDokumen';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { DOKUMEN as D } from '../../data/keamananData';
import { resetDaftar, sxSubBukti } from '../../theme/sx';

// Ringkasan legalitas: empat kartu dokumen (satu kolom di seluler, dua di sm,
// empat di md). Tiap kartu menaut ke halaman Legalitas yang memuat dokumennya.
export default function DokumenRingkas() {
  const { to, nonaktif } = propsAksi(D.rute);
  return (
    <Seksi
      varian="tint"
      aria-labelledby={D.id}
      padAtas={{ xs: '40px', md: '80px' }}
      padBawah={{ xs: '40px', md: '80px' }}
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id={D.id} sx={sxSubBukti} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: '16px',
          mt: '44px',
        }}
      >
        {D.butir.map((b) => (
          <li key={b.judul}>
            <KartuDokumen ikon={b.ikon} judul={b.judul} nomor={b.nomor} to={nonaktif ? undefined : to} verifikasi={b.verifikasi} />
          </li>
        ))}
      </Box>
    </Seksi>
  );
}

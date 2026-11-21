import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuIkon from '../../components/KartuIkon';
import { renderTeks } from '../../components/renderTeks';
import { NILAI as D } from '../../data/tentangKami';
import { resetDaftar } from '../../theme/sx';

// Nilai kami: tiga kartu ikon (satu kolom di bawah md).
export default function NilaiTentang() {
  return (
    <Seksi varian="terang" aria-labelledby={D.id}>
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id={D.id} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
          gap: '20px',
          mt: '44px',
        }}
      >
        {D.butir.map((b) => (
          <Box key={b.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              ikon={b.ikon}
              judul={b.judul}
              deskripsi={renderTeks(b.deskripsi)}
              ikonSx={{ width: 56, height: 56 }}
              verifikasi={b.verifikasi}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

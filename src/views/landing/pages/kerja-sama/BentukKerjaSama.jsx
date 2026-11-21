import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuIkon from '../../components/KartuIkon';
import { renderTeks } from '../../components/renderTeks';
import { BENTUK as D } from '../../data/kerjaSama';
import { resetDaftar } from '../../theme/sx';

// Tiga bentuk kerja sama: tiga kartu ikon dengan satu tag di dasar kartu (satu
// kolom di bawah md).
export default function BentukKerjaSama() {
  return (
    <Seksi varian="terang" aria-labelledby={D.id} padAtas={{ xs: '12px', md: '24px' }}>
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
              tag={b.tag}
              ikonSx={{ width: 56, height: 56 }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

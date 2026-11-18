import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import KartuIkon from '../../components/KartuIkon';
import { renderTeks } from '../../components/renderTeks';
import { CARA as D } from '../../data/guruMandiri';
import { resetDaftar } from '../../theme/sx';

// "Cara memakai": bagian gelap dengan tiga kartu langkah (kaca; kartu pertama
// berlatar gradasi), tiga kolom di md ke atas. Nomor langkah ada di judul kartu.
export default function CaraGuru() {
  return (
    <PerbandinganGelap id="judul-cara" idSeksi={D.id} eyebrow={D.eyebrow} judul={D.judul} jarak="48px" maxJudul={720}>
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
        {D.langkah.map((l) => (
          <Box key={l.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              varian="kaca"
              aksen={l.aksen}
              ikon={l.ikon}
              judul={l.judul}
              deskripsi={renderTeks(l.deskripsi)}
              ikonSx={{ width: 52, height: 52 }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </PerbandinganGelap>
  );
}

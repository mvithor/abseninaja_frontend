import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import KartuIkon from '../../components/KartuIkon';
import { renderTeks } from '../../components/renderTeks';
import { KEUNTUNGAN as D } from '../../data/afiliator';
import { huruf } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Keuntungan afiliator: bagian gelap dengan empat kartu kaca (kartu pertama
// berlatar gradasi), empat kolom di md, dua di sm, satu di seluler.
export default function KeuntunganAfiliator() {
  return (
    <PerbandinganGelap id={D.id} eyebrow={D.eyebrow} judul={D.judul} jarak="48px">
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: '18px',
        }}
      >
        {D.butir.map((b) => (
          <Box key={b.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              varian="kaca"
              aksen={b.aksen}
              ikon={b.ikon}
              judul={b.judul}
              deskripsi={renderTeks(b.deskripsi)}
              ikonSx={{ width: 52, height: 52 }}
              ikonUkuran={24}
              sxJudul={huruf.judulKeuntungan}
              verifikasi={b.verifikasi}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </PerbandinganGelap>
  );
}

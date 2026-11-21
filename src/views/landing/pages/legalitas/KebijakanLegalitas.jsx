import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { KEBIJAKAN as D } from '../../data/legalitas';
import { huruf } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Kebijakan: bagian gelap dengan tiga kartu kaca (kartu pertama berisi gradasi
// merek). Kotak ikon kuning 52 px dan judul 19 px (seluler 17).
export default function KebijakanLegalitas() {
  return (
    <PerbandinganGelap id={D.id} eyebrow={D.eyebrow} judul={D.judul} jarak="48px">
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
        {D.butir.map((b) => (
          <Box key={b.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              varian="kaca"
              aksen={b.aksen}
              ikon={b.ikon}
              ikonUkuran={24}
              judul={b.judul}
              deskripsi={renderTeks(b.deskripsi)}
              ekstra={<PenandaVerifikasi verifikasi={b.verifikasi} sx={{ alignSelf: 'flex-start' }} />}
              ikonSx={{ width: 52, height: 52 }}
              sxJudul={huruf.judulKartuKaca}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </PerbandinganGelap>
  );
}

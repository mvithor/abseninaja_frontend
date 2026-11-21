import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { TAHAP as D } from '../../data/keamananData';
import { colors } from '../../theme/tokens';
import { resetDaftar, sxSubBukti } from '../../theme/sx';

// Perjalanan data: bagian gelap dengan tiga kartu kaca bernomor tahap (urutan
// memang berurutan, jadi daftar berurutan <ol>). Kotak ikon kuning 52 px.
// Penanda lewat `ekstra` (bukan `penanda`) karena desain tidak punya baris tag
// kosong di kartu ini.
export default function TahapData() {
  return (
    <PerbandinganGelap
      id={D.id}
      eyebrow={D.eyebrow}
      judul={D.judul}
      sub={renderTeks(D.sub)}
      padAtas={{ xs: '40px', md: '80px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      jarak="48px"
      maxSub={520}
      sxJudul={sxSubBukti}
    >
      <Box
        component="ol"
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
              ikon={b.ikon}
              ikonUkuran={24}
              labelKanan={b.label}
              judul={b.judul}
              deskripsi={renderTeks(b.deskripsi)}
              ekstra={<PenandaVerifikasi verifikasi={b.verifikasi} sx={{ alignSelf: 'flex-start' }} />}
              ikonSx={{ width: 52, height: 52 }}
              sxDeskripsi={{ color: colors.onDark }}
              sx={{ flex: 1, minWidth: 0, border: `1px solid ${colors.garisKaca}` }}
            />
          </Box>
        ))}
      </Box>
    </PerbandinganGelap>
  );
}

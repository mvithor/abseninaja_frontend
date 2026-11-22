import { Box } from '@mui/material';
import PerbandinganGelap from '../../components/PerbandinganGelap';
import KartuIkon from '../../components/KartuIkon';
import { renderTeks } from '../../components/renderTeks';
import { BERIKUTNYA as D } from '../../data/kalkulator';
import { huruf } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// "Apa yang bisa dilakukan berikutnya": bagian gelap dengan tiga kartu kaca
// (kartu pertama bergradasi), kotak ikon kuning 52 px. Tiga kolom di md ke atas,
// satu kolom di bawahnya. Bukan urutan wajib, jadi daftar biasa (bukan bernomor).
export default function LangkahBerikutnya() {
  return (
    <PerbandinganGelap
      id={D.id}
      eyebrow={D.eyebrow}
      judul={D.judul}
      padAtas={{ xs: '38px', md: '76px' }}
      padBawah={{ xs: '42px', md: '84px' }}
      jarak="48px"
    >
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
        {D.butir.map((b, i) => (
          <Box key={b.judul} component="li" sx={{ display: 'flex', minWidth: 0 }}>
            <KartuIkon
              varian="kaca"
              aksen={i === 0}
              ikon={b.ikon}
              judul={b.judul}
              deskripsi={renderTeks(b.deskripsi)}
              verifikasi={b.verifikasi}
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

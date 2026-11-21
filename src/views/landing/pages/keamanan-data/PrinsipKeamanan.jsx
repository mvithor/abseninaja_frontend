import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { PRINSIP as D } from '../../data/keamananData';
import { gradients } from '../../theme/tokens';
import { resetDaftar, sxSubBukti } from '../../theme/sx';

// Empat prinsip: kartu ikon dua kolom di md ke atas, satu kolom di bawahnya.
// Kotak ikon 56 px di semua lebar (sudut 14 di seluler, 16 di web).
export default function PrinsipKeamanan() {
  return (
    <Seksi
      varian="terang"
      aria-labelledby={D.id}
      padAtas={{ xs: '40px', md: '80px' }}
      padBawah={{ xs: '40px', md: '80px' }}
      sx={{ background: gradients.hero }}
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id={D.id} maxJudul={700} sx={sxSubBukti} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
          gap: '20px',
          mt: '48px',
        }}
      >
        {D.butir.map((b) => (
          <Box key={b.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              ikon={b.ikon}
              judul={b.judul}
              deskripsi={renderTeks(b.deskripsi)}
              penanda={<PenandaVerifikasi verifikasi={b.verifikasi} />}
              ikonSx={{ width: 56, height: 56, borderRadius: { xs: '14px', md: '16px' } }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

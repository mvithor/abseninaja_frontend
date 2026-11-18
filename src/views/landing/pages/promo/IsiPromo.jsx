import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import KartuIkon from '../../components/KartuIkon';
import { renderTeks } from '../../components/renderTeks';
import { ISI as D } from '../../data/promo';
import { gradients } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Tiga butir isi promo: kartu ikon terang tanpa judul bagian (sesuai desain),
// satu kolom di bawah md. Latar gradasi hero.
export default function IsiPromo() {
  return (
    <Seksi
      varian="terang"
      id={D.id}
      padAtas={{ xs: '32px', md: '64px' }}
      padBawah={{ xs: '40px', md: '80px' }}
      sx={{ background: gradients.hero }}
      aria-label={D.label}
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
        {D.kartu.map((k) => (
          <Box key={k.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              ikon={k.ikon}
              judul={k.judul}
              deskripsi={renderTeks(k.deskripsi)}
              ikonSx={{ width: 56, height: 56 }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

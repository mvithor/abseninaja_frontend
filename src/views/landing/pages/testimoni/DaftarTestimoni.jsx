import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuTestimoni from '../../components/KartuTestimoni';
import { TESTIMONI as D } from '../../data/testimoni';
import { gradients } from '../../theme/tokens';
import { resetDaftar, sxSubBukti } from '../../theme/sx';

// Testimoni: enam kartu (satu kolom di seluler, dua di sm, tiga di md).
export default function DaftarTestimoni() {
  return (
    <Seksi
      varian="terang"
      aria-labelledby={D.id}
      padAtas={{ xs: '32px', md: '64px' }}
      padBawah={{ xs: '36px', md: '72px' }}
      sx={{ background: gradients.hero }}
    >
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id={D.id} sx={sxSubBukti} />
      <Box
        component="ul"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(3, minmax(0,1fr))' },
          gap: '20px',
          mt: '48px',
        }}
      >
        {D.butir.map((b) => (
          <li key={b.nama}>
            <KartuTestimoni
              kutipan={b.kutipan}
              nama={b.nama}
              peran={b.peran}
              peringkat={b.peringkat}
              verifikasi={b.verifikasi}
            />
          </li>
        ))}
      </Box>
    </Seksi>
  );
}

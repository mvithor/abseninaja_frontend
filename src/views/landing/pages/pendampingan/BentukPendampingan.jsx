import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { BENTUK as D } from '../../data/pendampingan';
import { resetDaftar } from '../../theme/sx';

// Tiga bentuk pendampingan: kartu ikon, satu kolom di bawah md.
export default function BentukPendampingan() {
  return (
    <Seksi varian="terang" id={D.id} padAtas="0px" padBawah="96px" aria-labelledby="judul-bentuk">
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id="judul-bentuk" maxJudul={700} />
      <Box
        component="ul"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' },
          gap: '20px',
          mt: '48px',
        }}
      >
        {D.kartu.map((k) => (
          <Box key={k.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              ikon={k.ikon}
              judul={k.judul}
              deskripsi={renderTeks(k.deskripsi)}
              tag={k.tag}
              penanda={<PenandaVerifikasi verifikasi={k.verifikasi} />}
              ikonSx={{ width: 56, height: 56 }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

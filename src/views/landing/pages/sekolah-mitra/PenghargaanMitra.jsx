import { Box } from '@mui/material';
import { IconSparkles } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { PENGHARGAAN as D } from '../../data/sekolahMitra';
import { gradients } from '../../theme/tokens';
import { resetDaftar, sxSubBukti } from '../../theme/sx';

// Penghargaan: tiga kartu ikon (satu kolom di bawah md). Kotak ikon 56 px di
// semua lebar (sudut 14 di seluler, 16 di web).
export default function PenghargaanMitra() {
  return (
    <Seksi varian="terang" aria-labelledby={D.id} sx={{ background: gradients.hero }}>
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id={D.id} sx={sxSubBukti} />
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
        {D.butir.map((b, i) => (
          // Judul penghargaan sama di desain, jadi kunci menambahkan urutan.
          <Box key={`${b.judul}-${i}`} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              ikon={IconSparkles}
              judul={b.judul}
              deskripsi={b.deskripsi}
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

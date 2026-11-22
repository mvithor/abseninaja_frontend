import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import KartuIkon from '../../components/KartuIkon';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { TERMASUK as D } from '../../data/paket';
import { resetDaftar } from '../../theme/sx';

// "Termasuk di setiap paket": tiga kartu ikon terang, satu kolom di bawah md.
export default function TermasukPaket() {
  return (
    <Seksi varian="terang" id={D.id} padAtas={{ xs: '36px', md: '72px' }} padBawah={{ xs: '48px', md: '96px' }} aria-labelledby="judul-termasuk">
      <JudulSeksi
        eyebrow={D.eyebrow}
        judul={D.judul}
        id="judul-termasuk"
        maxJudul={720}
        penanda={<PenandaVerifikasi verifikasi={D.verifikasi} />}
      />
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
        {D.kartu.map((k) => (
          <Box key={k.judul} component="li" sx={{ display: 'flex' }}>
            <KartuIkon
              ikon={k.ikon}
              judul={k.judul}
              deskripsi={renderTeks(k.deskripsi)}
              verifikasi={k.verifikasi}
              ikonSx={{ width: 56, height: 56 }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

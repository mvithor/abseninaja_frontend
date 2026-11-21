import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import FormulirKonversi from '../../components/FormulirKonversi';
import { renderTeks } from '../../components/renderTeks';
import { FORMULIR as D } from '../../data/kerjaSama';
import { gradients } from '../../theme/tokens';
import { sxJangkar, sxSubBukti } from '../../theme/sx';

// Ajukan kerja sama: judul di kiri, formulir empat keadaan di kanan; satu kolom
// di bawah md (judul lebih dulu).
export default function FormulirKerjaSama() {
  const f = D.formulir;
  return (
    <Seksi
      varian="terang"
      id={D.id}
      aria-labelledby="judul-ajukan"
      padAtas={{ xs: '36px', md: '72px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      sx={{ background: gradients.hero, ...sxJangkar }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,0.9fr) minmax(0,1.1fr)' },
          gap: { xs: '24px', md: '56px' },
          alignItems: 'center',
        }}
      >
        <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-ajukan" rata="kiri" sx={sxSubBukti} />
        <FormulirKonversi
          jenis="kerjaSama"
          judul={f.judul}
          tingkatJudul="h3"
          teksKirim={f.teksKirim}
          pesanWa={f.pesanWa}
          terkirim={{ sub: renderTeks(f.terkirim.sub) }}
          jaminan={f.jaminan}
          sx={{ p: { xs: '24px', md: '32px' } }}
        />
      </Box>
    </Seksi>
  );
}

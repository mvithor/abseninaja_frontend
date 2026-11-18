import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import FormulirKonversi from '../../components/FormulirKonversi';
import { renderTeks } from '../../components/renderTeks';
import { AKUN as D } from '../../data/guruMandiri';
import { gradients } from '../../theme/tokens';

// Permintaan akun: judul di kiri, formulir empat keadaan di kanan; satu kolom
// di bawah md. Bagian ini target jangkar tombol "Minta Akun Guru" di hero.
export default function AkunGuru() {
  const f = D.formulir;
  return (
    <Seksi
      varian="terang"
      id={D.id}
      padAtas={{ xs: '48px', md: '96px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      sx={{ background: gradients.hero, scrollMarginTop: '16px' }}
      aria-labelledby="judul-akun"
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,0.9fr) minmax(0,1.1fr)' },
          gap: { xs: '24px', md: '56px' },
          alignItems: 'center',
        }}
      >
        <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-akun" rata="kiri" />
        <FormulirKonversi
          jenis="guru"
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

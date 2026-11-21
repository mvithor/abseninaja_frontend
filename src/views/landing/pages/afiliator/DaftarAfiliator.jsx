import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import FormulirKonversi from '../../components/FormulirKonversi';
import { renderTeks } from '../../components/renderTeks';
import { DAFTAR as D } from '../../data/afiliator';
import { sxJangkar, sxSubBukti } from '../../theme/sx';

// Pendaftaran: judul dan catatan (KTP dan rekening tidak diminta) di kiri, formulir
// empat keadaan di kanan; satu kolom di bawah md. Target jangkar "Daftar Jadi
// Afiliator" di hero.
export default function DaftarAfiliator() {
  const f = D.formulir;
  return (
    <Seksi
      varian="terang"
      id={D.id}
      aria-labelledby="judul-daftar-afiliator"
      padAtas={{ xs: '48px', md: '96px' }}
      padBawah={{ xs: '48px', md: '96px' }}
      sx={sxJangkar}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,0.9fr) minmax(0,1.1fr)' },
          gap: { xs: '24px', md: '56px' },
          alignItems: 'center',
        }}
      >
        <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} sub={renderTeks(D.sub)} id="judul-daftar-afiliator" rata="kiri" sx={sxSubBukti} />
        <FormulirKonversi
          jenis="afiliator"
          judul={f.judul}
          tingkatJudul="h3"
          teksKirim={f.teksKirim}
          pesanWa={f.pesanWa}
          terkirim={f.terkirim}
          jaminan={f.jaminan}
          sx={{ p: { xs: '24px', md: '32px' } }}
        />
      </Box>
    </Seksi>
  );
}

import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import BarisKartuFakta from '../../components/BarisKartuFakta';
import FormulirKonversi from '../../components/FormulirKonversi';
import { renderTeks } from '../../components/renderTeks';
import { FORMULIR, HERO as D } from '../../data/jadwalkanDemo';
import { blobs, huruf } from '../../theme/tokens';

// Hero Jadwalkan Demo: kolom kiri (judul, subjudul, tiga kartu ringkas) dan
// kolom kanan formulir empat keadaan; satu kolom di bawah md (teks lebih dulu).
// Rata kiri, tanpa pemudaran putih di dasar, blob kanan di dasar (sesuai desain).
export default function HeroDemo() {
  return (
    <Seksi
      varian="hero"
      pudar={false}
      blobDaftar={blobs.heroBawah}
      padAtas={{ xs: '32px', md: '64px' }}
      padBawah={{ xs: '36px', md: '72px' }}
      aria-labelledby={D.id}
      kontainerSx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.05fr)' },
        gap: { xs: '24px', md: '56px' },
        alignItems: 'start',
        textAlign: 'left',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'flex-start' }}>
        <JudulSeksi
          eyebrow={D.eyebrow}
          judul={D.judul}
          sub={renderTeks(D.sub)}
          tingkat="h1"
          id={D.id}
          rata="kiri"
          maxJudul={560}
          maxSub={460}
          sx={{
            gap: '22px',
            '& > h1': huruf.judulFormulirHero,
            '& > h1 + p': { fontSize: { xs: '16px', md: '17px' } },
          }}
        />
        <BarisKartuFakta butir={D.kartu} varian="ringkas" sx={{ mt: '6px' }} />
      </Box>
      <FormulirKonversi
        jenis="demo"
        judul={FORMULIR.judul}
        teksKirim={FORMULIR.teksKirim}
        pesanWa={FORMULIR.pesanWa}
        terkirim={{ sub: renderTeks(FORMULIR.terkirim.sub), langkah: FORMULIR.terkirim.langkah }}
        jaminan={FORMULIR.jaminan}
      />
    </Seksi>
  );
}

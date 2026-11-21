import { Box } from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';
import Seksi from '../../components/Seksi';
import Eyebrow from '../../components/Eyebrow';
import TombolLanding from '../../components/TombolLanding';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { DaftarBlob } from '../../components/Blob';
import { renderTeks } from '../../components/renderTeks';
import { propsAksi } from '../../data/aksi';
import { KELAS_LATIHAN as D } from '../../data/analitik';
import { blobs, colors, gradients, radius, shadows } from '../../theme/tokens';

// Ajakan Kelas latihan: panel gradasi satu baris (teks di kiri, tombol di
// kanan; menumpuk di seluler). Kelas latihan ada di dalam akun, jadi tombol
// menuju permintaan akun guru mandiri.
export default function KelasLatihan() {
  return (
    <Seksi varian="terang" padAtas="0px" padBawah="72px" aria-labelledby="judul-kelas-latihan">
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '28px',
          boxSizing: 'border-box',
          p: { xs: '26px 20px', md: '40px 44px' },
          borderRadius: radius.kartuXL,
          background: gradients.brand,
          color: colors.white,
          boxShadow: shadows.kartuAksen,
        }}
      >
        <DaftarBlob daftar={blobs.banner} />
        <Box sx={{ position: 'relative', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <Eyebrow gelap component="p" sx={{ m: 0 }}>
            {D.eyebrow}
          </Eyebrow>
          <Box
            component="h2"
            id="judul-kelas-latihan"
            sx={{ m: 0, fontSize: { xs: '20px', md: '28px' }, fontWeight: 600, lineHeight: 1.25, color: colors.white }}
          >
            {D.judul}
          </Box>
          <Box component="p" sx={{ m: 0, fontSize: '15px', lineHeight: 1.7, color: colors.white }}>
            {renderTeks(D.teks)}
          </Box>
          <PenandaVerifikasi verifikasi={D.verifikasi} />
        </Box>
        <TombolLanding
          varian="kuning"
          ikonAkhir={<IconArrowRight size={18} stroke={2.2} aria-hidden="true" />}
          {...propsAksi(D.aksi.rute)}
          sx={{ position: 'relative' }}
        >
          {D.aksi.label}
        </TombolLanding>
      </Box>
    </Seksi>
  );
}

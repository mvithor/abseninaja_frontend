import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { DaftarBlob } from '../../components/Blob';
import { renderTeks } from '../../components/renderTeks';
import { PENDIRI as D } from '../../data/tentangKami';
import { blobs, colors, gradients, huruf, radius, shadows } from '../../theme/tokens';

// Cerita pembuat: bagian gelap dengan kartu pendiri (kotak inisial pengganti
// foto, rasio 4:3) di kiri dan cerita di kanan; satu kolom di bawah md (kartu
// lebih dulu). Inisial hanya hiasan (aria-hidden); peran tetap terbaca.
export default function PendiriTentang() {
  return (
    <Seksi
      varian="gelap"
      aria-labelledby={D.id}
      kontainerSx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.1fr)' },
        gap: { xs: '24px', md: '56px' },
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '4 / 3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.kartuXL,
          background: gradients.brand,
          color: colors.white,
          boxShadow: shadows.kartuAksen,
        }}
      >
        <DaftarBlob daftar={blobs.kartuPendiri} />
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <Box aria-hidden="true" sx={huruf.inisialPendiri}>
            {D.inisial}
          </Box>
          <Box sx={{ mt: '6px', fontSize: '14px', color: colors.onDarkTerang }}>{D.peran}</Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px', minWidth: 0 }}>
        <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id={D.id} gelap rata="kiri" />
        {D.paragraf.map((p, i) => (
          <Box
            key={i}
            component="p"
            sx={{
              m: 0,
              color: colors.onDarkSoft,
              textWrap: 'pretty',
              ...huruf.subjudul,
              fontSize: { xs: '15px', md: '16px' },
            }}
          >
            {renderTeks(p)}
          </Box>
        ))}
        <PenandaVerifikasi verifikasi={D.verifikasi} />
      </Box>
    </Seksi>
  );
}

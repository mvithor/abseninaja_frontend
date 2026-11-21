import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import JudulSeksi from '../../components/JudulSeksi';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { PERJALANAN as D } from '../../data/tentangKami';
import { colors, gradients, huruf, radius, shadows } from '../../theme/tokens';
import { resetDaftar } from '../../theme/sx';

// Perjalanan: linimasa berurutan menurut waktu (daftar berurutan). Empat kolom di
// md ke atas, dua di sm, satu di seluler. Tiap butir: penanda simpul dan garis
// (hiasan, aria-hidden) di atas kartu berisi tahun, judul, dan keterangan.
export default function PerjalananTentang() {
  return (
    <Seksi varian="terang" aria-labelledby={D.id} sx={{ background: gradients.hero }}>
      <JudulSeksi eyebrow={D.eyebrow} judul={D.judul} id={D.id} />
      <Box
        component="ol"
        role="list"
        sx={{
          ...resetDaftar,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' },
          gap: '20px',
          alignItems: 'stretch',
          mt: '48px',
        }}
      >
        {D.butir.map((b) => (
          <Box key={b.tahun} component="li" sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Box aria-hidden="true" sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box sx={{ width: 16, height: 16, flex: 'none', borderRadius: '50%', background: gradients.brand }} />
              <Box sx={{ flex: 1, height: '2px', background: gradients.stepLine }} />
            </Box>
            <Box
              sx={{
                flex: 1,
                boxSizing: 'border-box',
                p: '22px 24px',
                borderRadius: radius.kartu,
                background: colors.white,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.kartu,
              }}
            >
              <Box component="p" sx={{ m: 0, color: colors.accent, ...huruf.tahunLinimasa }}>
                {b.tahun}
              </Box>
              <Box component="h3" sx={{ m: '6px 0 0', color: colors.ink, ...huruf.judulLinimasa }}>
                {b.judul}
              </Box>
              <Box component="p" sx={{ m: '8px 0 0', fontSize: '14px', lineHeight: 1.7, color: colors.muted }}>
                {renderTeks(b.deskripsi)}
              </Box>
              <PenandaVerifikasi verifikasi={b.verifikasi} sx={{ mt: '12px' }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Seksi>
  );
}

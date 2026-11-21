import { Box } from '@mui/material';
import Seksi from '../../components/Seksi';
import Tag from '../../components/Tag';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import { renderTeks } from '../../components/renderTeks';
import { KUTIPAN as D } from '../../data/tentangKami';
import { colors, huruf, radius, shadows } from '../../theme/tokens';

// Kutipan pendiri: kartu lembut dengan tanda kutip besar di kiri (hiasan,
// aria-hidden), kutipan (blockquote), lalu nama dan peran (figcaption).
export default function KutipanPendiri() {
  return (
    <Seksi varian="terang" padAtas={{ xs: '36px', md: '72px' }} padBawah={{ xs: '12px', md: '24px' }}>
      <Box
        component="figure"
        sx={{
          m: 0,
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0,1fr)',
          columnGap: '24px',
          alignItems: 'start',
          boxSizing: 'border-box',
          p: { xs: '26px 20px', md: '40px 44px' },
          borderRadius: radius.kartuXL,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.kartu,
        }}
      >
        <Box component="span" aria-hidden="true" sx={{ gridRow: '1 / span 2', color: colors.brand, ...huruf.tandaKutip }}>
          {'“'}
        </Box>
        <Box component="blockquote" sx={{ m: 0 }}>
          <Box component="p" sx={{ m: 0, color: colors.ink, ...huruf.kutipanPendiri }}>
            {renderTeks(D.teks)}
          </Box>
        </Box>
        <Box component="figcaption" sx={{ mt: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box component="strong" sx={{ color: colors.ink, fontSize: '16px' }}>
            {D.nama}
          </Box>
          <Tag>{D.peran}</Tag>
          <PenandaVerifikasi verifikasi={D.verifikasi} />
        </Box>
      </Box>
    </Seksi>
  );
}

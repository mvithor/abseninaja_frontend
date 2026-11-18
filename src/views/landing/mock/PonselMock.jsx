import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, peraga, radius } from '../theme/tokens';

// Peraga ponsel wali murid dengan tiga notifikasi (data dummy, dekoratif:
// aria-hidden). Lebar 310 px, mengecil mengikuti kolom di layar sempit.
export default function PonselMock({ data }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: '100%',
        maxWidth: 310,
        boxSizing: 'border-box',
        background: colors.brandDeep,
        borderRadius: radius.ponsel,
        p: '12px',
        boxShadow: peraga.bayangan.ponsel,
      }}
    >
      <Box sx={{ background: colors.kartuTint, borderRadius: radius.layarPonsel, p: '20px 16px 24px', minHeight: 460, position: 'relative' }}>
        <Box sx={{ width: 90, height: 22, borderRadius: '12px', background: colors.brandDeep, m: '0 auto 18px' }} />
        <Box sx={{ fontSize: '13px', fontWeight: 600, color: colors.ink, textAlign: 'center' }}>{data.judul}</Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', mt: '20px' }}>
          {data.pesan.map((p) => (
            <Box
              key={p.waktu}
              sx={{ background: colors.white, borderRadius: radius.balon, p: '12px 14px', boxShadow: peraga.bayangan.balon }}
            >
              <Box sx={{ fontSize: '11px', color: colors.muted }}>{p.waktu}</Box>
              <Box sx={{ fontSize: '13px', lineHeight: 1.5, color: colors.ink, mt: '2px' }}>{p.teks}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

PonselMock.propTypes = {
  data: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    pesan: PropTypes.arrayOf(PropTypes.shape({ waktu: PropTypes.string, teks: PropTypes.string })).isRequired,
  }).isRequired,
};

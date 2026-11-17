import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, gradients, radius } from '../theme/tokens';
import { resetDaftar } from '../theme/sx';

// Langkah bernomor: kotak nomor gradasi + garis penghubung, di bawahnya kartu.
// Hanya untuk isi yang memang berurutan (daftar berurutan <ol>).
export default function LangkahBernomor({ langkah, kolom = 3, sx }) {
  return (
    <Box
      component="ol"
      sx={{
        ...resetDaftar,
        display: 'grid',
        gap: { xs: '24px', md: '20px' },
        gridTemplateColumns: {
          xs: 'minmax(0,1fr)',
          md: `repeat(${kolom}, minmax(0,1fr))`,
        },
        ...sx,
      }}
    >
      {langkah.map((l, i) => (
        <Box key={l.judul} component="li" sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                flex: 'none',
                borderRadius: radius.ikon,
                background: gradients.brand,
                color: colors.white,
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </Box>
            <Box aria-hidden="true" sx={{ flex: 1, height: '2px', background: gradients.stepLine }} />
          </Box>
          <Box
            sx={{
              p: { xs: '22px 20px', md: '22px 24px' },
              borderRadius: radius.kartuSedang,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: 'none',
              flex: 1,
            }}
          >
            <Box component="h3" sx={{ m: 0, fontSize: { xs: '17px', md: '18px' }, fontWeight: 600, color: colors.ink }}>
              {l.judul}
            </Box>
            <Box component="p" sx={{ m: '6px 0 0', fontSize: '14px', lineHeight: 1.7, color: colors.muted }}>
              {l.deskripsi}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

LangkahBernomor.propTypes = {
  langkah: PropTypes.arrayOf(
    PropTypes.shape({ judul: PropTypes.string.isRequired, deskripsi: PropTypes.node }),
  ).isRequired,
  kolom: PropTypes.number,
  sx: PropTypes.object,
};

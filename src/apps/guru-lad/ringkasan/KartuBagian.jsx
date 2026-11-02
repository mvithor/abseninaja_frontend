import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { gayaKartu, warnaRingkasan } from './gayaRingkasan';

/** Kartu bagian Ringkasan: judul 18px, keterangan, dan satu aksi di kanan atas (opsional). */
export default function KartuBagian({
  judul, keterangan, aksi, gaya = 'biasa', id, children, sx,
}) {
  const w = warnaRingkasan(useTheme());
  return (
    <Box
      component="section"
      id={id}
      aria-labelledby={id ? `${id}-judul` : undefined}
      sx={{
        ...gayaKartu(w, gaya),
        p: { xs: 2, md: '20px 24px' },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        ...sx,
      }}
    >
      {(judul || aksi) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: aksi ? 'center' : 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0, flex: '1 1 300px' }}>
            {judul && (
              <Typography
                component="h2"
                id={id ? `${id}-judul` : undefined}
                sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5, color: w.ink }}
              >
                {judul}
              </Typography>
            )}
            {keterangan && <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: w.sekunder, mt: 0.5, maxWidth: '80ch' }}>{keterangan}</Typography>}
          </Box>
          {aksi}
        </Box>
      )}
      {children}
    </Box>
  );
}

KartuBagian.propTypes = {
  judul: PropTypes.string,
  keterangan: PropTypes.node,
  aksi: PropTypes.node,
  gaya: PropTypes.oneOf(['biasa', 'tegas', 'putus']),
  id: PropTypes.string,
  children: PropTypes.node,
  sx: PropTypes.object,
};

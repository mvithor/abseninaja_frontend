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
        p: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        ...sx,
      }}
    >
      {(judul || aksi) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
            {judul && (
              <Typography
                component="h2"
                id={id ? `${id}-judul` : undefined}
                sx={{ fontSize: { xs: 17, md: 18 }, fontWeight: 700, lineHeight: 1.3, color: w.ink }}
              >
                {judul}
              </Typography>
            )}
            {keterangan && <Typography sx={{ fontSize: { xs: 13, md: 14 }, lineHeight: 1.45, color: w.sekunder }}>{keterangan}</Typography>}
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

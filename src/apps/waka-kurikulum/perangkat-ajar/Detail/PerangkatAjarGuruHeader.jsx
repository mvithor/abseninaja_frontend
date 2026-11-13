import PropTypes from 'prop-types';
import { Box, Chip, LinearProgress, Typography } from '@mui/material';

const RINGKASAN_ITEMS = [
  { key: 'disetujui', label: 'Disetujui', color: 'success' },
  { key: 'menunggu_validasi', label: 'Menunggu Validasi', color: 'warning' },
  { key: 'perlu_revisi', label: 'Perlu Revisi', color: 'error' },
  { key: 'belum_unggah', label: 'Belum Unggah', color: 'default' },
  { key: 'terlambat', label: 'Terlambat', color: 'error', variant: 'outlined' },
];

const PerangkatAjarGuruHeader = ({ guru, kelengkapanPersen, ringkasan, penugasanList }) => {
  const kelengkapan = Math.round(Number(kelengkapanPersen) || 0);
  const mapelUnik = [...new Set(penugasanList.map((p) => p.mapel?.nama).filter(Boolean))];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 3, mb: 3 }}>
      <Box>
        <Typography variant="h5">{guru?.nama || '-'}</Typography>
        <Typography variant="body2" color="text.secondary">NIP: {guru?.nip || '-'}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {mapelUnik.map((nama) => (
            <Chip key={nama} label={nama} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>

      <Box sx={{ minWidth: { xs: '100%', md: 360 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ minWidth: 90 }}>Kelengkapan</Typography>
          <LinearProgress
            variant="determinate"
            value={kelengkapan}
            color={kelengkapan >= 100 ? 'success' : kelengkapan >= 50 ? 'primary' : 'warning'}
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" sx={{ minWidth: 36 }}>{kelengkapan}%</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {RINGKASAN_ITEMS.map((item) => (
            <Chip
              key={item.key}
              label={`${item.label}: ${ringkasan?.[item.key] ?? 0}`}
              color={item.color}
              variant={item.variant || 'filled'}
              size="small"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

PerangkatAjarGuruHeader.propTypes = {
  guru: PropTypes.object,
  kelengkapanPersen: PropTypes.number,
  ringkasan: PropTypes.object,
  penugasanList: PropTypes.array.isRequired,
};

export default PerangkatAjarGuruHeader;

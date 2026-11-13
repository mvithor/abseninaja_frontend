import PropTypes from 'prop-types';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { dimensiMeta } from './pemetaanConfig';

// Faktor "perlu perhatian" per dimensi: ikon dimensi + teks alasan (tidak mengandalkan warna saja).
const PerhatianChips = ({ perhatian = [], ringkas = false }) => {
  if (perhatian.length === 0) {
    return <Typography variant="body2" color="text.secondary">-</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {perhatian.map((p) => {
        const meta = dimensiMeta(p.dimensi);
        const Icon = meta?.icon;
        const chip = (
          <Chip
            key={p.dimensi}
            size="small"
            variant="outlined"
            color="warning"
            icon={Icon ? <Icon size={14} /> : undefined}
            label={ringkas ? meta?.label : p.alasan}
          />
        );
        return ringkas ? (
          <Tooltip key={p.dimensi} title={p.alasan}>
            {chip}
          </Tooltip>
        ) : (
          chip
        );
      })}
    </Box>
  );
};

PerhatianChips.propTypes = {
  perhatian: PropTypes.arrayOf(PropTypes.shape({ dimensi: PropTypes.string, alasan: PropTypes.string })),
  ringkas: PropTypes.bool,
};

export default PerhatianChips;

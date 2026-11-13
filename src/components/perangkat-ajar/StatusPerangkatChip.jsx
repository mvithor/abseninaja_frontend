import PropTypes from 'prop-types';
import { Box, Chip } from '@mui/material';
import { IconLock } from '@tabler/icons-react';
import { STATUS_CONFIG, STATUS_PERANGKAT } from './perangkatAjarConfig';

// Chip status dokumen + penanda tambahan "Terlambat" dan "Terkunci" (bukan status).
const StatusPerangkatChip = ({ status, terlambat = false, terkunci = false }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[STATUS_PERANGKAT.BELUM_UNGGAH];

  return (
    <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
      <Chip label={config.label} color={config.color} size="small" />
      {terlambat && <Chip label="Terlambat" color="error" variant="outlined" size="small" />}
      {terkunci && (
        <Chip icon={<IconLock size={14} />} label="Terkunci" variant="outlined" size="small" />
      )}
    </Box>
  );
};

StatusPerangkatChip.propTypes = {
  status: PropTypes.string,
  terlambat: PropTypes.bool,
  terkunci: PropTypes.bool,
};

export default StatusPerangkatChip;

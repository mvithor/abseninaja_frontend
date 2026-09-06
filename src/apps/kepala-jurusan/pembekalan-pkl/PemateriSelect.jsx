import PropTypes from 'prop-types';
import { Box, Typography, TextField, MenuItem, useTheme } from '@mui/material';
import { IconUserCheck } from '@tabler/icons-react';

// Pemilih pemateri (guru) untuk satu grup profil. Opsi berasal dari
// fetchPemateriOptions (dummy, mudah disambung endpoint guru nanti).
const PemateriSelect = ({ pemateriId, options, onChange, disabled }) => {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
        <IconUserCheck size={18} color={theme.palette.primary.main} />
        <Typography variant="body2" fontWeight={700}>Pemateri</Typography>
      </Box>

      <TextField
        select
        fullWidth
        size="small"
        label="Pilih pemateri"
        value={pemateriId || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || !options?.length}
      >
        {(options || []).map((g) => (
          <MenuItem key={g.id} value={g.id}>
            {g.nama}{g.bidang ? ` — ${g.bidang}` : ''}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

PemateriSelect.propTypes = {
  pemateriId: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PemateriSelect;

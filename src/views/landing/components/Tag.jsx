import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, radius } from '../theme/tokens';

// Tag: sudut 6. `biasa` = chip merek, `status` = label status berteks
// (warna tidak berdiri sendiri, selalu ada label).
const varianSx = {
  biasa: {
    height: 26,
    px: '10px',
    background: colors.tint,
    color: colors.accent,
    fontSize: '12px',
    fontWeight: 500,
  },
  status: {
    height: 24,
    px: '10px',
    background: colors.statusBg,
    color: colors.statusInk,
    fontSize: '11px',
    fontWeight: 600,
  },
};

export default function Tag({ children, varian = 'biasa', sx }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: radius.tag,
        whiteSpace: 'nowrap',
        ...varianSx[varian],
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  varian: PropTypes.oneOf(['biasa', 'status']),
  sx: PropTypes.object,
};

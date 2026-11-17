import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, huruf } from '../theme/tokens';

// Label bagian: teks kapital 12,5 px, jarak huruf 0,14em, garis kuning 22x2
// di kiri dan kanan. Di latar gelap teks berwarna kuning.
const garis = {
  content: '""',
  width: '22px',
  height: '2px',
  background: colors.yellow,
  flex: 'none',
};

export default function Eyebrow({ children, gelap = false, sx, component = 'span', ...rest }) {
  return (
    <Box
      component={component}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        color: gelap ? colors.yellow : colors.accent,
        ...huruf.eyebrow,
        '&::before': garis,
        '&::after': garis,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

Eyebrow.propTypes = {
  children: PropTypes.node.isRequired,
  gelap: PropTypes.bool,
  sx: PropTypes.object,
  component: PropTypes.elementType,
};

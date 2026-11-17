import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { layout } from '../theme/tokens';

// Pembungkus lebar konten: maks 1200, padding 40 (seluler 20).
export default function Kontainer({ children, sx, component = 'div', ...rest }) {
  return (
    <Box
      component={component}
      sx={{
        width: '100%',
        maxWidth: layout.lebarKonten,
        mx: 'auto',
        px: layout.padX,
        boxSizing: 'border-box',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

Kontainer.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
  component: PropTypes.elementType,
};

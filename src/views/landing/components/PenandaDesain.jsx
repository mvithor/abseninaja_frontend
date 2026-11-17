import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, flags, radius } from '../theme/tokens';

// Penanda [VERIFIKASI] dan teks contoh. Penanda desain, bukan teks permanen:
// tersembunyi secara bawaan lewat flags.tampilkanPenandaDesain di tokens.js.
// Prop `tampil` hanya untuk halaman uji (DevFondasi).
export default function PenandaDesain({ children = 'Verifikasi', tampil, sx }) {
  const nyala = tampil === undefined ? flags.tampilkanPenandaDesain : tampil;
  if (!nyala) return null;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        px: '10px',
        border: `1px dashed ${colors.verifyBorder}`,
        borderRadius: radius.tag,
        background: colors.verifyBg,
        color: colors.verifyInk,
        fontSize: '11px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

PenandaDesain.propTypes = {
  children: PropTypes.node,
  tampil: PropTypes.bool,
  sx: PropTypes.object,
};

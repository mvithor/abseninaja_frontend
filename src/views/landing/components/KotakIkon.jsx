import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, gradients, radius } from '../theme/tokens';

// Kotak ikon gradasi merek (dekoratif, aria-hidden). Ukuran bawaan mengikuti
// desain: 52 px dan sudut 16 di web, 46 px dan sudut 14 di seluler.
export default function KotakIkon({
  ikon,
  ukuran = { xs: 46, md: 52 },
  ikonUkuran = 26,
  stroke = 2,
  sudut = { xs: '14px', md: radius.ikon },
  latar = gradients.brand,
  warna = colors.white,
  sx,
}) {
  const Ikon = ikon;
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: ukuran,
        height: ukuran,
        flex: 'none',
        borderRadius: sudut,
        background: latar,
        color: warna,
        ...sx,
      }}
    >
      <Ikon size={ikonUkuran} stroke={stroke} />
    </Box>
  );
}

KotakIkon.propTypes = {
  ikon: PropTypes.elementType.isRequired,
  ukuran: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  ikonUkuran: PropTypes.number,
  stroke: PropTypes.number,
  sudut: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  latar: PropTypes.string,
  warna: PropTypes.string,
  sx: PropTypes.object,
};

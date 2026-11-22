import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors, huruf, radius } from '../../theme/tokens';

// Cincin skor: lingkaran conic-gradient (hiasan) dengan angka persen yang
// ditulis sebagai teks di tengah. Angka dan satuan adalah teks sungguhan, jadi
// skor tidak hanya terlihat lewat warna. Tidak ada animasi.
export default function CincinSkor({ persen, satuan }) {
  const derajat = Math.min(100, Math.max(0, persen)) * 3.6;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 160,
        height: 160,
        flex: 'none',
        borderRadius: radius.lingkaran,
        background: `conic-gradient(${colors.brand} ${derajat}deg, ${colors.border} 0)`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 124,
          height: 124,
          borderRadius: radius.lingkaran,
          background: colors.white,
        }}
      >
        <Box component="span" sx={{ color: colors.ink, ...huruf.angkaSkor }}>
          {persen}
        </Box>
        <Box component="span" sx={{ fontSize: '12px', color: colors.muted }}>
          {satuan}
        </Box>
      </Box>
    </Box>
  );
}

CincinSkor.propTypes = {
  persen: PropTypes.number.isRequired,
  satuan: PropTypes.string.isRequired,
};

import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import PenandaVerifikasi from '../../components/PenandaVerifikasi';
import TombolLanding from '../../components/TombolLanding';
import CincinSkor from './CincinSkor';
import { propsAksi } from '../../data/aksi';
import { HASIL as D } from '../../data/kalkulator';
import { colors, huruf } from '../../theme/tokens';

// Hasil: cincin skor (angka sebagai teks), nama tingkat (heading, sasaran fokus),
// saran, penanda desain, lalu "Jadwalkan Demo" dan "Ulangi". Nama tingkat dan
// saran dari data; teks tidak memuat klaim berbasis angka.
export default function LayarHasil({ persen, namaTingkat, saran, onUlangi, fokusRef }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
      <CincinSkor persen={persen} satuan={D.satuan} />
      <Box component="h2" ref={fokusRef} tabIndex={-1} sx={{ m: 0, color: colors.ink, ...huruf.judulTingkat }}>
        {namaTingkat}
      </Box>
      <Box component="p" sx={{ m: 0, maxWidth: 420, color: colors.muted, textWrap: 'pretty', ...huruf.subjudul, fontSize: { xs: '15px', md: '16px' } }}>
        {saran}
      </Box>
      <PenandaVerifikasi verifikasi={D.verifikasi} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', mt: '8px' }}>
        <TombolLanding {...propsAksi(D.aksiDemo.rute)}>{D.aksiDemo.label}</TombolLanding>
        <TombolLanding varian="garis" onClick={onUlangi}>
          {D.ulangi}
        </TombolLanding>
      </Box>
    </Box>
  );
}

LayarHasil.propTypes = {
  persen: PropTypes.number.isRequired,
  namaTingkat: PropTypes.string.isRequired,
  saran: PropTypes.string.isRequired,
  onUlangi: PropTypes.func.isRequired,
  fokusRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

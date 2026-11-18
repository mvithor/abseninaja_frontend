import PropTypes from 'prop-types';
import PenandaDesain from './PenandaDesain';

// Penanda [VERIFIKASI] dari bendera data. `verifikasi` bernilai true (label
// bawaan "Verifikasi"), teks label khusus, atau kosong (tidak menampilkan apa
// pun). Tampil hanya bila flags.tampilkanPenandaDesain menyala (lihat PenandaDesain).
export default function PenandaVerifikasi({ verifikasi, sx }) {
  if (!verifikasi) return null;
  return <PenandaDesain sx={sx}>{typeof verifikasi === 'string' ? verifikasi : undefined}</PenandaDesain>;
}

PenandaVerifikasi.propTypes = {
  verifikasi: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  sx: PropTypes.object,
};

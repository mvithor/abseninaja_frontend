import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Seksi from './Seksi';
import JudulSeksi from './JudulSeksi';

// Bagian gelap perbandingan (halaman dalam): label kuning, judul putih dengan
// kata kuning (tanda *kata*), subjudul opsional, lalu isi perbandingan di
// `children` (tabel atau dua kartu). Padding dan jarak ke isi menyesuaikan
// desain tiap halaman lewat prop.
export default function PerbandinganGelap({
  eyebrow,
  judul,
  sub,
  id,
  padAtas,
  padBawah,
  jarak = '56px',
  maxJudul = 720,
  maxSub = 520,
  sxJudul,
  children,
  sx,
}) {
  return (
    <Seksi varian="gelap" padAtas={padAtas} padBawah={padBawah} aria-labelledby={id} sx={sx}>
      <JudulSeksi eyebrow={eyebrow} judul={judul} sub={sub} id={id} gelap maxJudul={maxJudul} maxSub={maxSub} sx={sxJudul} />
      <Box sx={{ mt: jarak }}>{children}</Box>
    </Seksi>
  );
}

PerbandinganGelap.propTypes = {
  eyebrow: PropTypes.node,
  judul: PropTypes.node.isRequired,
  sub: PropTypes.node,
  id: PropTypes.string.isRequired,
  padAtas: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  padBawah: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  jarak: PropTypes.string,
  maxJudul: PropTypes.number,
  maxSub: PropTypes.number,
  sxJudul: PropTypes.object,
  children: PropTypes.node,
  sx: PropTypes.object,
};

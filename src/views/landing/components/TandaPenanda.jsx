import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { peragaLad, radius } from '../theme/tokens';

// Tanda penanda LAD (P1 sampai P5): kotak kecil sudut 6 berisi kode (dan nama,
// bila diberikan lewat `children`). `nada`: perhatian (P1 sampai P4, kuning)
// atau pengayaan (P5, hijau muda). Kode selalu tertulis; warna hanya penegas.
const NADA = {
  perhatian: { bg: peragaLad.perhatianBg, ink: peragaLad.perhatianInk, garis: peragaLad.perhatianGaris },
  pengayaan: { bg: peragaLad.pengayaanBg, ink: peragaLad.pengayaanInk, garis: peragaLad.pengayaanGaris },
};

export default function TandaPenanda({ kode, nada = 'perhatian', children, sx }) {
  const n = NADA[nada];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        // content-box seperti desain: tinggi 22 dan lebar minimum 26 belum termasuk
        // padding dan tepi.
        boxSizing: 'content-box',
        minHeight: 22,
        px: '6px',
        borderRadius: radius.tag,
        background: n.bg,
        color: n.ink,
        border: `1px solid ${n.garis}`,
        fontSize: '11px',
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {children ?? kode}
    </Box>
  );
}

TandaPenanda.propTypes = {
  kode: PropTypes.string,
  nada: PropTypes.oneOf(['perhatian', 'pengayaan']),
  children: PropTypes.node,
  sx: PropTypes.object,
};

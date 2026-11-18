import PropTypes from 'prop-types';
import { Box } from '@mui/material';

// Lingkaran buram latar (dekoratif, aria-hidden). Spesifikasi dari blobs di
// tokens.js: { left | right, top | bottom, size, color, blur }.
export default function Blob({ spec }) {
  const { size, color, blur, ...posisi } = spec;
  const pos = {};
  Object.entries(posisi).forEach(([k, v]) => {
    pos[k] = `${v}px`;
  });
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        ...pos,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
      }}
    />
  );
}

Blob.propTypes = { spec: PropTypes.object.isRequired };

// Beberapa blob sekaligus (daftar dari tokens.blobs).
export function DaftarBlob({ daftar }) {
  return daftar.map((b, i) => <Blob key={i} spec={b} />);
}

DaftarBlob.propTypes = { daftar: PropTypes.arrayOf(PropTypes.object).isRequired };

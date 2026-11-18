import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { colors } from '../theme/tokens';

// Pembungkus kolom formulir: label terhubung (`label htmlFor`), tanda wajib
// (aria-hidden; status wajib dibawa atribut `required` pada kolom), isi kolom
// (`children`), dan pesan galat berid `${id}-galat` untuk aria-describedby.
// Galat selalu berupa teks; warna tidak berdiri sendiri.
export default function PembungkusKolom({ id, label, wajib = false, galat, children, sx }) {
  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      <Box
        component="label"
        htmlFor={id}
        sx={{ display: 'block', mb: '6px', fontSize: '13px', fontWeight: 600, color: colors.ink }}
      >
        {label}
        {wajib && (
          <Box component="span" aria-hidden="true">
            {' *'}
          </Box>
        )}
      </Box>
      {children}
      {galat && (
        <Box id={`${id}-galat`} sx={{ mt: '6px', fontSize: '12px', lineHeight: 1.5, color: colors.galat }}>
          {galat}
        </Box>
      )}
    </Box>
  );
}

PembungkusKolom.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  wajib: PropTypes.bool,
  galat: PropTypes.string,
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};

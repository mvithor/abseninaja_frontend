import PropTypes from 'prop-types';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { VERIFIKASI_OPTIONS } from './perangkatAjarConfig';

// Filter cepat Semua / Terverifikasi / Belum Terverifikasi (selalu terlihat, bukan di dialog filter).
const FilterVerifikasi = ({ value, onChange }) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    size="small"
    color="primary"
    // Klik ulang tombol aktif mengirim null; abaikan supaya selalu ada satu pilihan.
    onChange={(_e, next) => next !== null && onChange(next)}
    sx={{ height: 40, '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5 } }}
  >
    {VERIFIKASI_OPTIONS.map((opt) => (
      <ToggleButton key={opt.value || 'semua'} value={opt.value}>
        {opt.label}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

FilterVerifikasi.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FilterVerifikasi;

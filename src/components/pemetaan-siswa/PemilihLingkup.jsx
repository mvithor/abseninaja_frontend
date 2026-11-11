import PropTypes from 'prop-types';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { LINGKUP } from './pemetaanConfig';

// Hanya dirender untuk koordinator BK; anggota selalu melihat kelas tanggung jawabnya sendiri.
const PemilihLingkup = ({ value, onChange }) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    size="small"
    color="primary"
    onChange={(_e, next) => next && onChange(next)}
    sx={{ height: 40, '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5 } }}
  >
    <ToggleButton value={LINGKUP.SAYA}>Kelas Saya</ToggleButton>
    <ToggleButton value={LINGKUP.SEMUA}>Semua Kelas</ToggleButton>
  </ToggleButtonGroup>
);

PemilihLingkup.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PemilihLingkup;

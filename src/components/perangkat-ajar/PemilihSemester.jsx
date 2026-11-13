import PropTypes from 'prop-types';
import { MenuItem } from '@mui/material';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import { labelSemester } from './useSemesterTerpilih';

const PemilihSemester = ({ options, value, onChange, isLoading = false, sx }) => (
  <CustomSelect
    id="semester"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    displayEmpty
    disabled={isLoading || options.length === 0}
    size="small"
    sx={{ minWidth: 220, height: 40, ...sx }}
  >
    <MenuItem value="" disabled>
      {isLoading ? 'Memuat semester...' : 'Pilih Semester'}
    </MenuItem>
    {options.map((s) => (
      <MenuItem key={s.id} value={s.id}>
        {labelSemester(s)}{s.is_aktif ? ' (Aktif)' : ''}
      </MenuItem>
    ))}
  </CustomSelect>
);

PemilihSemester.propTypes = {
  options: PropTypes.array.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  sx: PropTypes.object,
};

export default PemilihSemester;

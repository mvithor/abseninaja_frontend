import Grid from '@mui/material/Grid';
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  FormControl,
  Select,
} from '@mui/material';
import { IconHash, IconBook2 } from '@tabler/icons-react';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';

const KATEGORI_OPTIONS = [
  { value: 'kompetensi_umum', label: 'Kompetensi Umum' },
  { value: 'kompetensi_inti', label: 'Kompetensi Inti' },
  { value: 'kompetensi_pilihan', label: 'Kompetensi Pilihan' },
];

const SkkniUnitEditForm = ({ skkniUnitData, handleChange, handleSubmit, handleCancel, isLoading }) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kode_unit" sx={{ mt: 1.85 }}>Kode Unit</CustomFormLabel>
          <CustomOutlinedInput
            id="kode_unit"
            name="kode_unit"
            value={skkniUnitData.kode_unit || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconHash /></InputAdornment>}
            fullWidth
            required
            inputProps={{ maxLength: 20 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="judul_unit" sx={{ mt: 1.85 }}>Judul Unit</CustomFormLabel>
          <CustomOutlinedInput
            id="judul_unit"
            name="judul_unit"
            value={skkniUnitData.judul_unit || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconBook2 /></InputAdornment>}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kategori" sx={{ mt: 1.85 }}>Kategori</CustomFormLabel>
          <CustomSelect
            id="kategori"
            name="kategori"
            value={skkniUnitData.kategori || ''}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            inputProps={{ 'aria-label': 'Pilih Kategori' }}
            MenuProps={{
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' },
              PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
            }}
          >
            <MenuItem value="" disabled>
              Pilih Kategori
            </MenuItem>
            {KATEGORI_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_aktif" sx={{ mt: 1.85 }}>Status</CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="is_aktif"
              name="is_aktif"
              value={Boolean(skkniUnitData.is_aktif)}
              onChange={handleChange}
              sx={{ '& .MuiSelect-select': { py: '10.5px' } }}
            >
              <MenuItem value={true}>Aktif</MenuItem>
              <MenuItem value={false}>Nonaktif</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default SkkniUnitEditForm;
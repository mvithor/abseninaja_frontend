import Grid from '@mui/material/Grid';
import {
  Box,
  InputAdornment,
  CircularProgress,
  MenuItem,
  FormControl,
  Select,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  IconBuilding,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconUsers,
} from '@tabler/icons-react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';

const MitraIndustriEditForm = ({
  mitraIndustriData,
  handleChange,
  handleDateChange,
  selectedSkkni,
  onSkkniChange,
  skkniOptions,
  isSkkniLoading,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
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
          <CustomFormLabel htmlFor="nama_industri" sx={{ mt: 1.85 }}>Nama Industri</CustomFormLabel>
          <CustomOutlinedInput
            id="nama_industri"
            name="nama_industri"
            value={mitraIndustriData.nama_industri || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconBuilding /></InputAdornment>}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kapasitas_per_periode" sx={{ mt: 1.85 }}>Kapasitas per Periode</CustomFormLabel>
          <CustomOutlinedInput
            id="kapasitas_per_periode"
            name="kapasitas_per_periode"
            type="number"
            value={mitraIndustriData.kapasitas_per_periode ?? ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconUsers /></InputAdornment>}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama_kontak" sx={{ mt: 1.85 }}>Nama Kontak</CustomFormLabel>
          <CustomOutlinedInput
            id="nama_kontak"
            name="nama_kontak"
            value={mitraIndustriData.nama_kontak || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="telepon_kontak" sx={{ mt: 1.85 }}>Telepon Kontak</CustomFormLabel>
          <CustomOutlinedInput
            id="telepon_kontak"
            name="telepon_kontak"
            value={mitraIndustriData.telepon_kontak || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconPhone /></InputAdornment>}
            fullWidth
            required
            inputProps={{ maxLength: 15 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="email_kontak" sx={{ mt: 1.85 }}>Email Kontak (Opsional)</CustomFormLabel>
          <CustomOutlinedInput
            id="email_kontak"
            name="email_kontak"
            type="email"
            value={mitraIndustriData.email_kontak || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconMail /></InputAdornment>}
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tanggal_mulai_kemitraan" sx={{ mt: 1.85 }}>Tanggal Mulai Kemitraan</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={
                mitraIndustriData.tanggal_mulai_kemitraan
                  ? new Date(mitraIndustriData.tanggal_mulai_kemitraan)
                  : null
              }
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  InputProps: {
                    sx: { height: '46px', paddingHorizontal: 0 },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kemauan_membimbing_teknis" sx={{ mt: 1.85 }}>Kemauan Membimbing Teknis</CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="kemauan_membimbing_teknis"
              name="kemauan_membimbing_teknis"
              value={Boolean(mitraIndustriData.kemauan_membimbing_teknis)}
              onChange={handleChange}
              sx={{ '& .MuiSelect-select': { py: '10.5px' } }}
            >
              <MenuItem value={true}>Ya</MenuItem>
              <MenuItem value={false}>Tidak</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="status_aktif" sx={{ mt: 1.85 }}>Status</CustomFormLabel>
          <FormControl fullWidth>
            <Select
              id="status_aktif"
              name="status_aktif"
              value={Boolean(mitraIndustriData.status_aktif)}
              onChange={handleChange}
              sx={{ '& .MuiSelect-select': { py: '10.5px' } }}
            >
              <MenuItem value={true}>Aktif</MenuItem>
              <MenuItem value={false}>Nonaktif</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <CustomFormLabel htmlFor="alamat_industri" sx={{ mt: 1.85 }}>Alamat Industri</CustomFormLabel>
          <CustomOutlinedInput
            id="alamat_industri"
            name="alamat_industri"
            value={mitraIndustriData.alamat_industri || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconMapPin /></InputAdornment>}
            fullWidth
            required
            multiline
            minRows={2}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <CustomFormLabel htmlFor="skkni_unit_ids" sx={{ mt: 1.85 }}>
            Unit SKKNI yang Dilatih (Opsional)
          </CustomFormLabel>
          <Autocomplete
            multiple
            disableCloseOnSelect
            id="skkni_unit_ids"
            options={skkniOptions}
            loading={isSkkniLoading}
            getOptionLabel={(opt) => `${opt?.kode_unit || ''} — ${opt?.judul_unit || ''}`}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            value={selectedSkkni}
            onChange={(_, value) => onSkkniChange(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={isSkkniLoading ? 'Memuat unit SKKNI...' : 'Pilih satu atau lebih unit'}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default MitraIndustriEditForm;
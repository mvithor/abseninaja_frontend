import Grid from '@mui/material/Grid';
import { Alert, Box, CircularProgress, InputAdornment } from '@mui/material';
import { IconCalendar, IconClock, IconFileText, IconNotes } from '@tabler/icons-react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import { labelSemester } from 'src/components/perangkat-ajar/useSemesterTerpilih';

// Semester & jenis tidak bisa diubah (satu jenis = satu deadline per semester); hapus lalu buat baru bila keliru.
const DeadlinePerangkatAjarEditForm = ({
  deadlineData,
  handleChange,
  handleDateChange,
  handleSubmit,
  handleCancel,
  isLoading,
  isSubmitting,
  sudahLewat,
  bacaSaja = false,
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
      {bacaSaja && (
        <Alert severity="info" sx={{ mt: 4 }}>
          Semester ini sudah diarsipkan. Deadline-nya tidak bisa diubah lagi.
        </Alert>
      )}
      {!bacaSaja && sudahLewat && (
        <Alert severity="warning" sx={{ mt: 4 }}>
          Deadline ini sudah lewat dan unggahan sedang terkunci. Memundurkan deadline akan membuka kembali unggahan,
          dan penanda &quot;Terlambat&quot; akan dihitung ulang oleh sistem.
        </Alert>
      )}
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="semester" sx={{ mt: 1.85 }}>Semester Ajaran</CustomFormLabel>
          <CustomOutlinedInput
            id="semester"
            value={labelSemester(deadlineData.semester_ajaran)}
            startAdornment={<InputAdornment position="start"><IconCalendar /></InputAdornment>}
            fullWidth
            disabled
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="jenis" sx={{ mt: 1.85 }}>Jenis Perangkat Ajar</CustomFormLabel>
          <CustomOutlinedInput
            id="jenis"
            value={deadlineData.jenis?.label || '-'}
            startAdornment={<InputAdornment position="start"><IconFileText /></InputAdornment>}
            fullWidth
            disabled
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="tanggal_deadline" sx={{ mt: 1.85 }}>Tanggal Deadline</CustomFormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={deadlineData.tanggal_deadline}
              onChange={handleDateChange}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  InputProps: { sx: { height: '46px' } },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="jam_deadline" sx={{ mt: 1.85 }}>Jam Deadline (waktu sekolah)</CustomFormLabel>
          <CustomOutlinedInput
            id="jam_deadline"
            name="jam_deadline"
            type="time"
            value={deadlineData.jam_deadline || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconClock /></InputAdornment>}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="keterangan" sx={{ mt: 1.85 }}>Keterangan (Opsional)</CustomFormLabel>
          <CustomOutlinedInput
            id="keterangan"
            name="keterangan"
            value={deadlineData.keterangan || ''}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconNotes /></InputAdornment>}
            fullWidth
            multiline
            minRows={2}
            inputProps={{ maxLength: 1000 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        {!bacaSaja && <SubmitButton isLoading={isSubmitting}>Simpan</SubmitButton>}
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default DeadlinePerangkatAjarEditForm;

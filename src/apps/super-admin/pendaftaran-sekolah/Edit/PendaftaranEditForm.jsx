import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';

const PendaftaranEditForm = ({
  statusOptions,
  isLoadingStatus,
  selectedPendaftaran,
  handleSubmit,
  handleCancel,
}) => {
  const [status_id, setStatus_id] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPendaftaran?.status_id) {
      setStatus_id(selectedPendaftaran.status_id);
    }
  }, [selectedPendaftaran]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleSubmit({ status_id: Number(status_id) });
    setIsSubmitting(false);
  };

  if (!selectedPendaftaran) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={56} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Typography variant="h6" gutterBottom>Informasi Sekolah</Typography>

      <Grid container spacing={2} rowSpacing={1} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel>Nama Sekolah</CustomFormLabel>
          <Typography variant="body1" sx={{ pt: 1, fontWeight: 500 }}>
            {selectedPendaftaran.nama || '—'}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel>NPSN</CustomFormLabel>
          <Typography variant="body1" sx={{ pt: 1, fontWeight: 500 }}>
            {selectedPendaftaran.npsn || '—'}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel>Nama Admin</CustomFormLabel>
          <Typography variant="body1" sx={{ pt: 1, fontWeight: 500 }}>
            {selectedPendaftaran.nama_admin || '—'}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel>Zona Waktu</CustomFormLabel>
          <Typography variant="body1" sx={{ pt: 1, fontWeight: 500 }}>
            {selectedPendaftaran.timezone_sekolah || '—'}
          </Typography>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Ubah Status Pendaftaran</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="status_id">Status</CustomFormLabel>

          <FormControl fullWidth>
            {isLoadingStatus ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <Select
                id="status_id"
                name="status_id"
                value={status_id}
                onChange={(e) => setStatus_id(e.target.value)}
                displayEmpty
                required
              >
                <MenuItem value="" disabled>
                  Pilih status...
                </MenuItem>
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.status_pendaftaran}
                  </MenuItem>
                ))}
              </Select>
            )}
            <FormHelperText>
              Status saat ini:{' '}
              {statusOptions.find((o) => o.id === selectedPendaftaran.status_id)
                ?.status_pendaftaran || '—'}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton
          type="submit"
          disabled={isSubmitting || isLoadingStatus || !status_id}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PendaftaranEditForm;
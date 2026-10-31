import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, InputAdornment, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { IconUser, IconMail, IconLock } from '@tabler/icons-react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import {
  BATAS,
  adaPerubahan,
  bangunPayloadBuat,
  bangunPayloadUbah,
  validasiBuat,
  validasiUbah,
} from 'src/apps/admin-sekolah/admin-kantin/kantin';

// Satu form untuk Tambah (mode "buat") dan Edit (mode "ubah"). Perbedaannya hanya pada
// password: wajib saat buat, opsional saat ubah (diisi berarti reset dan semua sesi dicabut).
const AdminKantinForm = ({ mode, awal, onSubmit, isLoading, setError, onCancel }) => {
  const ubah = mode === 'ubah';
  const [formState, setFormState] = useState({
    nama: awal?.nama || '',
    email: awal?.email || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const pesan = ubah ? validasiUbah(formState) : validasiBuat(formState);
    if (pesan) {
      setError(pesan);
      return;
    }
    if (ubah && !adaPerubahan(awal, formState)) {
      setError('Tidak ada perubahan untuk disimpan.');
      return;
    }
    setError('');
    onSubmit(ubah ? bangunPayloadUbah(formState) : bangunPayloadBuat(formState));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: -2 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>Nama</CustomFormLabel>
          <CustomOutlinedInput
            id="nama"
            name="nama"
            value={formState.nama}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
            inputProps={{ maxLength: BATAS.NAMA_MAX }}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="email" sx={{ mt: 1.85 }}>Email</CustomFormLabel>
          <CustomOutlinedInput
            id="email"
            name="email"
            type="email"
            value={formState.email}
            onChange={handleChange}
            startAdornment={<InputAdornment position="start"><IconMail /></InputAdornment>}
            inputProps={{ maxLength: BATAS.EMAIL_MAX }}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="password" sx={{ mt: 1.85 }}>
            {ubah ? 'Password Baru (opsional)' : 'Password'}
          </CustomFormLabel>
          <CustomOutlinedInput
            id="password"
            name="password"
            value={formState.password}
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            startAdornment={<InputAdornment position="start"><IconLock /></InputAdornment>}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            inputProps={{ maxLength: BATAS.PASSWORD_MAX }}
            fullWidth
            required={!ubah}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {ubah
              ? 'Kosongkan bila tidak ingin mengganti. Mengganti password mengeluarkan akun ini dari semua perangkat.'
              : `Minimal ${BATAS.PASSWORD_MIN} karakter. Akun login lewat web dengan email dan password ini.`}
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }}>
        <SubmitButton isLoading={isLoading}>Simpan</SubmitButton>
        <CancelButton onClick={onCancel} />
      </Box>
    </Box>
  );
};

AdminKantinForm.propTypes = {
  mode: PropTypes.oneOf(['buat', 'ubah']).isRequired,
  awal: PropTypes.shape({ nama: PropTypes.string, email: PropTypes.string }),
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  setError: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default AdminKantinForm;

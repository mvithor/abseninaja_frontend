import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CancelButton from 'src/components/button-group/CancelButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import {
  BATAS_KANTIN_SEKOLAH,
  bangunPayloadUnitKantin,
  validasiUnitKantin,
} from '../kantinSekolah';

const STATE_KOSONG = {
  nama_kantin: '',
  admin_kantin_id: '',
  penanggung_jawab: '',
  lokasi: '',
  is_aktif: true,
};

const UnitKantinFormDialog = ({
  buka,
  mode,
  awal,
  opsiAdmin = [],
  sibuk = false,
  errorServer = '',
  onSimpan,
  onTutup,
}) => {
  const [formState, setFormState] = useState(STATE_KOSONG);
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setErrorLokal('');
    if (mode === 'ubah' && awal) {
      setFormState({
        nama_kantin: awal.nama_kantin || '',
        admin_kantin_id: awal.admin_kantin_id ? String(awal.admin_kantin_id) : '',
        penanggung_jawab: awal.penanggung_jawab || '',
        lokasi: awal.lokasi || '',
        is_aktif: Boolean(awal.is_aktif),
      });
    } else {
      setFormState(STATE_KOSONG);
    }
  }, [buka, mode, awal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const galat = validasiUnitKantin(formState);
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onSimpan(bangunPayloadUnitKantin({ mode, form: formState }));
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-unit-kantin">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-unit-kantin">
          {mode === 'ubah' ? 'Edit Unit Kantin & Penautan Akun' : 'Tambah Unit Kantin Baru'}
        </DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="nama_kantin" sx={{ mt: 0 }}>
                Nama Unit Kantin
              </CustomFormLabel>
              <CustomOutlinedInput
                id="nama_kantin"
                name="nama_kantin"
                value={formState.nama_kantin}
                onChange={handleChange}
                placeholder="Contoh: Kantin Sehat Gedung A"
                inputProps={{ maxLength: BATAS_KANTIN_SEKOLAH.NAMA_KANTIN_MAX }}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="admin_kantin_id" sx={{ mt: 0 }}>
                Akun Admin Kantin Pengelola
              </CustomFormLabel>
              <CustomSelect
                id="admin_kantin_id"
                name="admin_kantin_id"
                displayEmpty
                value={formState.admin_kantin_id}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Belum ditautkan (opsional)</MenuItem>
                {opsiAdmin.map((akun) => {
                  const alasanDisable = !akun.is_aktif
                    ? ' (Akun nonaktif)'
                    : akun.tertautKeLain
                      ? ` (Sudah tertaut ke ${akun.tertautKeUnit})`
                      : '';
                  return (
                    <MenuItem key={akun.id} value={String(akun.id)} disabled={!akun.bisaDipilih}>
                      {akun.nama || '-'} · {akun.email || '-'}
                      {alasanDisable}
                    </MenuItem>
                  );
                })}
              </CustomSelect>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="penanggung_jawab" sx={{ mt: 0 }}>
                Penanggung Jawab (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="penanggung_jawab"
                name="penanggung_jawab"
                value={formState.penanggung_jawab}
                onChange={handleChange}
                placeholder="Nama pengelola / pemilik"
                inputProps={{ maxLength: BATAS_KANTIN_SEKOLAH.PJ_MAX }}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="lokasi" sx={{ mt: 0 }}>
                Lokasi Unit (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="lokasi"
                name="lokasi"
                value={formState.lokasi}
                onChange={handleChange}
                placeholder="Contoh: Lantai 1 Sayap Barat"
                inputProps={{ maxLength: BATAS_KANTIN_SEKOLAH.LOKASI_MAX }}
                fullWidth
              />
            </Grid>

            {mode === 'ubah' && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(formState.is_aktif)}
                      onChange={(e) => setFormState((prev) => ({ ...prev, is_aktif: e.target.checked }))}
                    />
                  }
                  label={
                    formState.is_aktif
                      ? 'Unit Kantin Aktif (kasir POS & kelola menu terbuka)'
                      : 'Unit Kantin Nonaktif (kasir POS & mutasi dikunci sementara)'
                  }
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>{mode === 'ubah' ? 'Simpan Perubahan' : 'Simpan Unit'}</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

UnitKantinFormDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['buat', 'ubah']).isRequired,
  awal: PropTypes.object,
  opsiAdmin: PropTypes.array,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onSimpan: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export default UnitKantinFormDialog;

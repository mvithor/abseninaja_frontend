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
  Select,
  Switch,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CancelButton from 'src/components/button-group/CancelButton';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import { BATAS_KANTIN, KATEGORI_MENU, bangunPayloadMenu, validasiMenu } from '../kantin';

const STATE_KOSONG = {
  nama_menu: '',
  kategori: 'makanan',
  harga: '',
  is_tersedia: true,
  foto_url: '',
};

const MenuFormDialog = ({ buka, mode, awal, sibuk = false, errorServer = '', onSimpan, onTutup }) => {
  const [formState, setFormState] = useState(STATE_KOSONG);
  const [errorLokal, setErrorLokal] = useState('');

  useEffect(() => {
    if (!buka) return;
    setErrorLokal('');
    if (mode === 'ubah' && awal) {
      setFormState({
        nama_menu: awal.nama_menu || '',
        kategori: awal.kategori || 'makanan',
        harga: String(awal.harga ?? ''),
        is_tersedia: Boolean(awal.is_tersedia),
        foto_url: awal.foto_url || '',
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
    const kandidat = {
      ...formState,
      harga: formState.harga === '' ? '' : Number(formState.harga),
    };
    const galat = validasiMenu(kandidat);
    if (galat) {
      setErrorLokal(galat);
      return;
    }
    setErrorLokal('');
    onSimpan(bangunPayloadMenu(kandidat));
  };

  const pesanError = errorLokal || errorServer;

  return (
    <Dialog open={buka} onClose={sibuk ? undefined : onTutup} maxWidth="sm" fullWidth aria-labelledby="judul-form-menu">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle id="judul-form-menu">{mode === 'ubah' ? 'Edit Menu Kantin' : 'Tambah Menu Kantin'}</DialogTitle>
        <DialogContent dividers>
          {pesanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pesanError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="nama_menu" sx={{ mt: 0 }}>
                Nama Menu
              </CustomFormLabel>
              <CustomOutlinedInput
                id="nama_menu"
                name="nama_menu"
                value={formState.nama_menu}
                onChange={handleChange}
                placeholder="Contoh: Nasi Goreng Spesial"
                inputProps={{ maxLength: BATAS_KANTIN.NAMA_MENU_MAX }}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="kategori" sx={{ mt: 0 }}>
                Kategori
              </CustomFormLabel>
              <Select
                id="kategori"
                name="kategori"
                value={formState.kategori}
                onChange={handleChange}
                fullWidth
              >
                {KATEGORI_MENU.map((kat) => (
                  <MenuItem key={kat.kode} value={kat.kode}>
                    {kat.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="harga" sx={{ mt: 0 }}>
                Harga (Rupiah)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="harga"
                name="harga"
                type="number"
                value={formState.harga}
                onChange={handleChange}
                placeholder="10000"
                inputProps={{ min: 0, step: 100 }}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomFormLabel htmlFor="foto_url" sx={{ mt: 0 }}>
                URL Foto Menu (opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="foto_url"
                name="foto_url"
                value={formState.foto_url}
                onChange={handleChange}
                placeholder="https://..."
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formState.is_tersedia)}
                    onChange={(e) => setFormState((prev) => ({ ...prev, is_tersedia: e.target.checked }))}
                  />
                }
                label={formState.is_tersedia ? 'Tersedia di kasir' : 'Habis / disembunyikan di kasir'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <CancelButton onClick={onTutup} />
          <SubmitButton isLoading={sibuk}>{mode === 'ubah' ? 'Simpan Perubahan' : 'Simpan Menu'}</SubmitButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

MenuFormDialog.propTypes = {
  buka: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['buat', 'ubah']).isRequired,
  awal: PropTypes.object,
  sibuk: PropTypes.bool,
  errorServer: PropTypes.string,
  onSimpan: PropTypes.func.isRequired,
  onTutup: PropTypes.func.isRequired,
};

export default MenuFormDialog;

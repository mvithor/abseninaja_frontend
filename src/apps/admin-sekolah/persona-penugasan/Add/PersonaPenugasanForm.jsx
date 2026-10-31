import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, CircularProgress, MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import axiosInstance from 'src/utils/axiosInstance';
import {
  bangunPayloadBeri,
  pesanGalat,
  petunjukPersona,
  validasiBeri,
} from 'src/apps/admin-sekolah/persona-penugasan/penugasan';

const URL_API = '/api/v1/admin-sekolah/persona-penugasan';
const MENU_PROPS = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
};

const adaPetunjuk = (petunjuk) => petunjuk.tahan || petunjuk.catatan.length > 0;

const PersonaPenugasanForm = ({ setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({ kode: '', pegawaiId: '', catatan: '' });

  const { data: katalog, isLoading: katalogMemuat, isError: katalogGagal } = useQuery({
    queryKey: ['personaKatalog'],
    queryFn: async () => (await axiosInstance.get(`${URL_API}/katalog`)).data.data,
  });

  const { data: pegawaiOptions = [], isLoading: pegawaiMemuat } = useQuery({
    queryKey: ['pegawaiOptions'],
    queryFn: async () => (await axiosInstance.get('/api/v1/admin-sekolah/dropdown/pegawai')).data.data,
  });

  const mutation = useMutation({
    mutationFn: async (payload) => (await axiosInstance.post(URL_API, payload)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personaPenugasan'] });
      navigate('/dashboard/admin-sekolah/persona-penugasan', {
        state: { pesan: data.msg || 'Persona berhasil diberikan.' },
      });
    },
    onError: (err) => setError(pesanGalat(err, 'Terjadi kesalahan saat memberikan persona.')),
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const pesan = validasiBeri({ pegawaiId: formState.pegawaiId, kode: formState.kode, katalog });
    if (pesan) {
      setError(pesan);
      return;
    }
    setError('');
    mutation.mutate(bangunPayloadBeri(formState));
  };

  if (katalogMemuat) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  if (katalogGagal || !katalog) {
    return <Alert severity="error">Gagal memuat daftar persona. Muat ulang halaman ini.</Alert>;
  }

  const personaTerpilih = katalog.persona.find((p) => p.kode === formState.kode);
  const petunjuk = petunjukPersona(personaTerpilih, katalog.tahun_ajaran_aktif);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -2 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="kode" sx={{ mt: 1.85 }}>Persona</CustomFormLabel>
          <CustomSelect
            id="kode"
            name="kode"
            value={formState.kode}
            onChange={handleChange}
            fullWidth
            displayEmpty
            MenuProps={MENU_PROPS}
          >
            <MenuItem value="" disabled>Pilih Persona</MenuItem>
            {katalog.persona.map((p) => (
              <MenuItem key={p.kode} value={p.kode}>{p.label}</MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="pegawaiId" sx={{ mt: 1.85 }}>Pegawai</CustomFormLabel>
          <CustomSelect
            id="pegawaiId"
            name="pegawaiId"
            value={formState.pegawaiId}
            onChange={handleChange}
            fullWidth
            displayEmpty
            MenuProps={MENU_PROPS}
          >
            <MenuItem value="" disabled>{pegawaiMemuat ? 'Memuat...' : 'Pilih Pegawai'}</MenuItem>
            {!pegawaiMemuat && pegawaiOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.nama}
                {option.kategori && option.kategori !== '-' ? ` (${option.kategori})` : ''}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        {adaPetunjuk(petunjuk) && (
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            {petunjuk.tahan && <Alert severity="warning" sx={{ mb: 1 }}>{petunjuk.alasanTahan}</Alert>}
            {petunjuk.catatan.map((teks) => (
              <Alert key={teks} severity="info" sx={{ mb: 1 }}>{teks}</Alert>
            ))}
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="catatan" sx={{ mt: 1.85 }}>Catatan (opsional)</CustomFormLabel>
          <CustomTextField
            id="catatan"
            name="catatan"
            value={formState.catatan}
            onChange={handleChange}
            placeholder="Contoh: SK Kepala Madrasah No. 12/2026"
            multiline
            minRows={2}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }}>
        <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
        <CancelButton onClick={() => navigate(-1)}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PersonaPenugasanForm;

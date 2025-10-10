import { useState } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment, Autocomplete, TextField, FormControlLabel, Checkbox } from "@mui/material";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBook2, IconNumbers } from '@tabler/icons-react'; 
import { useMutation, useQuery } from '@tanstack/react-query';

const TambahMataPelajaranForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();

  const [formState ,setFormState] = useState ({
    kode_mapel: '',
    nama_mapel: ''
  });

  const [useAllClasses, setUseAllClasses] = useState(true);
  const [selectedKelas, setSelectedKelas] = useState([]); 

  const kelasQuery = useQuery({
    queryKey: ['kelas-list'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/kelas');
      return Array.isArray(res.data?.data) ? res.data.data : [];
    }
  });

  const mutation = useMutation({
    mutationKey: ["tambahMapel"],
    mutationFn: async (newMapel) => {
      const payload = {
        kode_mapel: String(newMapel.kode_mapel || '').trim().toUpperCase(),
        nama_mapel: String(newMapel.nama_mapel || '').trim().replace(/\s+/g, ' ')
      };

      if (!useAllClasses) {
        const ids = selectedKelas.map(k => k.id).filter(Boolean);
        if (ids.length > 0) payload.kelas_ids = ids;
      }
      const response = await axiosInstance.post('/api/v1/admin-sekolah/mata-pelajaran', payload);
      return response.data; 
    },
    onSuccess: (response) => {
      const count = Array.isArray(response.offerings) ? response.offerings.length : 0;
      const preview = count
        ? ` • ${count} penawaran terbuat (contoh: ${response.offerings[0].kode_offering})`
        : '';
      setSuccess(`${response.msg}${preview}`);
      setTimeout(() => navigate("/dashboard/admin-sekolah/mata-pelajaran"), 2000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan mata pelajaran";
      setError(errorDetails.length > 0 ? errorDetails.join(", ") : errorMsg);
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    const next = name === 'kode_mapel' ? value.toUpperCase() : value;
    setFormState((prevState) => ({ ...prevState, [name]: next }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!useAllClasses && selectedKelas.length === 0) {
      setError('Silakan pilih minimal satu kelas atau aktifkan opsi "Semua Kelas".');
      setTimeout(() => setError(''), 3000);
      return;
    }

    mutation.mutate(formState);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const kelasLoading = kelasQuery.isLoading;
  const kelasOptions = kelasQuery.data || [];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" alignItems="center">
            <CustomFormLabel htmlFor="kode_mapel" sx={{ mt: 1.85 }}>
              Kode Mata Pelajaran
            </CustomFormLabel>
          </Box>
          <CustomOutlinedInput
            startAdornment={<InputAdornment position="start"><IconNumbers /></InputAdornment>}
            id="kode_mapel"
            name="kode_mapel"
            value={formState.kode_mapel}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" alignItems="center">
            <CustomFormLabel htmlFor="nama_mapel" sx={{ mt: 1.85 }}>
              Mata Pelajaran
            </CustomFormLabel>
          </Box>
          <CustomOutlinedInput
            startAdornment={<InputAdornment position="start"><IconBook2 /></InputAdornment>}
            id="nama_mapel"
            name="nama_mapel"
            value={formState.nama_mapel}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useAllClasses}
                onChange={(e) => setUseAllClasses(e.target.checked)}
              />
            }
            label="Generate untuk Semua Kelas"
          />
        </Grid>

        {!useAllClasses && (
          <Grid size={{ xs: 12, md: 12 }}>
            <Box display="flex" alignItems="center">
              <CustomFormLabel htmlFor="kelas_ids" sx={{ mt: 1.85 }}>
                Pilih Kelas
              </CustomFormLabel>
            </Box>
            <Autocomplete
              multiple
              disableCloseOnSelect
              id="kelas_ids"
              options={kelasOptions}
              loading={kelasLoading}
              getOptionLabel={(opt) => opt?.nama_kelas || ''}
              value={selectedKelas}
              onChange={(_, value) => setSelectedKelas(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={kelasLoading ? "Memuat kelas..." : "Pilih satu atau lebih kelas"}
                />
              )}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel} disabled={mutation.isPending}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default TambahMataPelajaranForm;

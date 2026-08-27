import { useState } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment } from "@mui/material";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBuildingArch, IconHash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const TambahJurusanForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    nama: '',
    kode_lokal: '',
  });

  const mutation = useMutation({
    mutationKey: ["tambahJurusan"],
    mutationFn: async (newJurusan) => {
      const payload = {
        nama: String(newJurusan.nama || '').trim().replace(/\s+/g, ' '),
        kode_lokal: String(newJurusan.kode_lokal || '').trim(),
      };
      const response = await axiosInstance.post('/api/v1/admin-sekolah/jurusan', payload);
      return response.data;
    },
    onSuccess: (response) => {
      setSuccess(response.msg);
      setError('');
      queryClient.invalidateQueries(['jurusan-list']);
      setTimeout(() => navigate("/dashboard/admin-sekolah/jurusan"), 2000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan jurusan";
      setError(errorDetails.length > 0 ? errorDetails.join(", ") : errorMsg);
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(formState);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" alignItems="center">
            <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
              Nama Jurusan
            </CustomFormLabel>
          </Box>
          <CustomOutlinedInput
            startAdornment={<InputAdornment position="start"><IconBuildingArch /></InputAdornment>}
            id="nama"
            name="nama"
            value={formState.nama}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" alignItems="center">
            <CustomFormLabel htmlFor="kode_lokal" sx={{ mt: 1.85 }}>
              Kode Lokal
            </CustomFormLabel>
          </Box>
          <CustomOutlinedInput
            startAdornment={<InputAdornment position="start"><IconHash /></InputAdornment>}
            id="kode_lokal"
            name="kode_lokal"
            value={formState.kode_lokal}
            onChange={handleChange}
            fullWidth
            inputProps={{ maxLength: 20 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton isLoading={mutation.isPending}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel} disabled={mutation.isPending}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default TambahJurusanForm;
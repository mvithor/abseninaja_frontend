import Grid from '@mui/material/Grid';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment,
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconAccessPoint } from '@tabler/icons-react'; 
import { useMutation } from '@tanstack/react-query';
import axiosInstance from "src/utils/axiosInstance";

const StatusKehadiranForm = ({ setSuccess, setError }) => {
  const [namaStatus, setNamaStatus] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (newStatusKehadiran) => {
      const response = await axiosInstance.post('/api/v1/admin-sekolah/status-kehadiran', newStatusKehadiran);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      setTimeout(() => navigate('/dashboard/admin-sekolah/status-kehadiran'), 3000);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan status kehadiran';
      const errorDetails = error.response?.data?.errors || [];
      if (errorDetails.length > 0) {
        setError(errorDetails.map(err => err.message).join(', '));
      } else {
        setError(errorMsg);
      }
      setSuccess('');
    },
    onSettled: () => {
      setTimeout(() => {
        setLoading(false);
        setError("");
        setSuccess("");
      }, 3000);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!namaStatus) {
      setError("Status Kehadiran tidak boleh kosong");
      return;
    }

    setLoading(true);
    mutation.mutate({
      nama_status: namaStatus,
      deskripsi: deskripsi || null
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowGap={1}>
        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="namaStatus" sx={{ mt: 1.85 }}>
            Status Kehadiran
          </CustomFormLabel>
          <CustomOutlinedInput
            startAdornment={
              <InputAdornment position="start">
                <IconAccessPoint />
              </InputAdornment>
            }
            id="namaStatus"
            name="namaStatus"
            value={namaStatus}
            onChange={(e) => setNamaStatus(e.target.value)}
            placeholder="Masukkan Status Kehadiran"
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>
            Deskripsi (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="deskripsi"
            name="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Contoh: Untuk seminar di luar sekolah"
            fullWidth
            multiline
            rows={1}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }}>
            <SubmitButton isLoading={loading}>Simpan</SubmitButton>
            <CancelButton onClick={handleCancel}>Batal</CancelButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusKehadiranForm;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem, CircularProgress } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TimePicker } from "@mui/x-date-pickers";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import axiosInstance from "src/utils/axiosInstance";

const WaktuForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    jam_mulai: null,
    jam_selesai: null,
    kategori_waktu_id: "",
    hari_id: ""
  });

  const { data: kategoriWaktuOptions = [], isError: kategoriWaktuError } = useQuery({
    queryKey: ["kategoriWaktuOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/kategori-waktu');
      return response.data.data;
    }
  });

  const { data: hariOptions = [], isError: hariError } = useQuery({
    queryKey: ["hariOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/hari');
      return response.data.data;
    }
  });

  const mutation = useMutation({
    mutationKey: ["tambahWaktu"],
    mutationFn: async (newWaktu) => {
      const response = await axiosInstance.post('/api/v1/admin-sekolah/waktu', newWaktu);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/waktu"), 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan data waktu";
      if (errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setSuccess("");
      setTimeout(() => setError(''), 3000);
    },
    onSettled: () => {
      setLoading(false);          // ← matikan loading sesudah selesai
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTimeChange = (field, value) => {
    if (value) {
      const formattedTime = `${value.getHours().toString().padStart(2, '0')}.${value.getMinutes().toString().padStart(2, '0')}`;
      setFormState((prevState) => ({
        ...prevState,
        [field]: formattedTime,
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.jam_mulai || !formState.jam_selesai) {
      setError("Waktu mulai dan selesai harus diisi dengan format yang valid");
      return;
    }

    setLoading(true);               // ← nyalakan loading pas submit
    mutation.mutate(formState);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (kategoriWaktuError || hariError) {
    return <div>Error Loading Data...</div>
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="jam_mulai" sx={{ mt: 1.85 }}>Waktu Mulai</CustomFormLabel>
            <TimePicker
              ampm={false}
              disableMaskedInput
              value={
                formState.jam_mulai
                  ? new Date(`1970-01-01T${formState.jam_mulai.replace('.', ':')}:00`)
                  : null
              }
              onChange={(value) => handleTimeChange("jam_mulai", value)}
              desktopModeMediaQuery="@media (min-width:9999px)" // Paksa gunakan mobile
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "medium",
                  required: true,
                  disabled: loading,    // ← nonaktif saat loading
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="jam_selesai" sx={{ mt: 1.85 }}>Waktu Selesai</CustomFormLabel>
            <TimePicker
              ampm={false}
              disableMaskedInput
              value={
                formState.jam_selesai
                  ? new Date(`1970-01-01T${formState.jam_selesai.replace('.', ':')}:00`)
                  : null
              }
              onChange={(value) => handleTimeChange("jam_selesai", value)}
              desktopModeMediaQuery="@media (min-width:9999px)" // Paksa gunakan mobile
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "medium",
                  required: true,
                  disabled: loading,    // ← nonaktif saat loading
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="kategori_waktu_id" sx={{ mt: 1.85 }}>Kategori Waktu</CustomFormLabel>
            <CustomSelect
              id="kategori_waktu_id"
              name="kategori_waktu_id"
              value={formState.kategori_waktu_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              inputProps={{ "aria-label": "Pilih Kategori Waktu" }}
              disabled={loading}         // ← nonaktif saat loading
            >
              <MenuItem value="" disabled>
                Pilih Kategori Waktu
              </MenuItem>
              {kategoriWaktuOptions.map((kategoriOption) => (
                <MenuItem key={kategoriOption.id} value={kategoriOption.id}>
                  {kategoriOption.nama_kategori}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="hari_id" sx={{ mt: 1.85 }}>Hari</CustomFormLabel>
            <CustomSelect
              id="hari_id"
              name="hari_id"
              value={formState.hari_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              inputProps={{ "aria-label": "Pilih Hari" }}
              disabled={loading}         // ← nonaktif saat loading
            >
              <MenuItem value="" disabled>
                Pilih Hari
              </MenuItem>
              {hariOptions.map((hariOption) => (
                <MenuItem key={hariOption.id} value={hariOption.id}>
                  {hariOption.nama_hari}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }}>
          <SubmitButton
            isLoading={loading}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}  // ← spinner kiri
          >
            Simpan
          </SubmitButton>
          <CancelButton onClick={handleCancel} disabled={loading}>
            Batal
          </CancelButton>
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default WaktuForm;

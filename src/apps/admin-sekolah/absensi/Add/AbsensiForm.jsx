import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import axiosInstance from "src/utils/axiosInstance";

const AbsensiForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    siswa_id: '',
    kelas_id: '',
    nama_kelas: '', 
    tanggal: '',
    jam_masuk: null,
    jam_pulang: null,
    status_kehadiran_id: '',
    keterangan: ''
  });

  const { data: siswaOptions = [], isError: siswaError } = useQuery({
    queryKey: ["siswaOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/siswa');
      return response.data.data;
    }
  });

  const { data: statusOptions = [], isError: statusError } = useQuery({
    queryKey: ["statusOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/status-kehadiran');
      return response.data.data;
    }
  });

  const mutation = useMutation({
    mutationKey: ["tambahAbsensi"],
    mutationFn: async (newAbsensi) => {
      const response = await axiosInstance.post('/api/v1/admin-sekolah/absensi/manual', newAbsensi);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.msg);
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/absensi-siswa"), 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan data absensi";
      if (errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setSuccess(""); 
    },
    onSettled: () => {
      setTimeout(() => {
        setLoading(false);
        setError("");
        setSuccess("");
      }, 3000);
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "siswa_id") {
      const selectedSiswa = siswaOptions.find((siswa) => siswa.id === value);
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
        kelas_id: selectedSiswa?.kelas_id || '',
        nama_kelas: selectedSiswa?.Kelas.nama_kelas || 'Tidak Diketahui',
      }));
    } else {
      setFormState((prevState) => ({ ...prevState, [name]: value }));
      if (name === "status_kehadiran_id") {
        const selected = statusOptions.find((item) => item.id === value);
        const isCustom = selected && !selected.is_global;
        setFormState((prevState) => ({
          ...prevState,
          jam_masuk: isCustom ? null : prevState.jam_masuk,
          jam_pulang: isCustom ? null : prevState.jam_pulang,
        }));
      }
    }
  };

  const handleDateChange = (date) => setFormState((prevState) => ({ ...prevState, tanggal: date }));

  const handleTimeChange = (field, value) => {
    if (value) {
      const formattedTime = `${value.getHours().toString().padStart(2, '0')}.${value.getMinutes().toString().padStart(2, '0')}`;
      setFormState((prevState) => ({ ...prevState, [field]: formattedTime }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.tanggal || !formState.status_kehadiran_id) {
      setError("Tanggal dan status kehadiran harus diisi");
      return;
    }
    mutation.mutate(formState);
  };

  const handleCancel = () => navigate(-1);

  if (siswaError || statusError) return <div>Error Loading Data...</div>;

  const selectedStatus = statusOptions.find((item) => item.id === formState.status_kehadiran_id);
  const isCustomStatus = selectedStatus && !selectedStatus.is_global;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="siswa_id" sx={{ mt: 1.85 }}>Nama Siswa</CustomFormLabel>
            <Autocomplete
              id="siswa_id"
              options={siswaOptions}
              getOptionLabel={(option) => option.User.name}
              value={siswaOptions.find((siswa) => siswa.id === formState.siswa_id) || null}
              onChange={(event, newValue) => {
                setFormState({
                  ...formState,
                  siswa_id: newValue ? newValue.id : "",
                  kelas_id: newValue ? newValue.kelas_id : "",
                  nama_kelas: newValue ? newValue.Kelas.nama_kelas : "Tidak Diketahui"
                });
              }}
              renderInput={(params) => (
                <CustomTextField {...params} fullWidth placeholder="Cari / Pilih nama siswa" aria-label="Pilih nama siswa" InputProps={{ ...params.InputProps, style: { height: 45 } }} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="nama_kelas" sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
            <CustomTextField id="nama_kelas" name="nama_kelas" value={formState.nama_kelas} fullWidth disabled />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="tanggal" sx={{ mt: 1.85 }}>Tanggal</CustomFormLabel>
            <DatePicker value={formState.tanggal || null} onChange={handleDateChange} placeholder="Masukkan Tanggal" slotProps={{ textField: { fullWidth: true, size: 'medium', required: true, InputProps: { sx: { height: '46px' } } } }} />
          </Grid>

          {!isCustomStatus && (
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="jam_masuk" sx={{ mt: 1.85 }}>Jam Masuk</CustomFormLabel>
              <TimePicker ampm={false} disableMaskedInput value={formState.jam_masuk ? new Date(`1970-01-01T${formState.jam_masuk.replace('.', ':')}:00`) : null} onChange={(value) => handleTimeChange("jam_masuk", value)} desktopModeMediaQuery="@media (min-width:9999px)" enableAccessibleFieldDOMStructure={false} slotProps={{ textField: { fullWidth: true, size: "medium", required: true } }} />
            </Grid>
          )}

          {!isCustomStatus && (
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="jam_pulang" sx={{ mt: 1.85 }}>Jam Pulang</CustomFormLabel>
              <TimePicker ampm={false} disableMaskedInput value={formState.jam_pulang ? new Date(`1970-01-01T${formState.jam_pulang.replace('.', ':')}:00`) : null} onChange={(value) => handleTimeChange("jam_pulang", value)} desktopModeMediaQuery="@media (min-width:9999px)" enableAccessibleFieldDOMStructure={false} slotProps={{ textField: { fullWidth: true, size: "medium", required: true } }} />
            </Grid>
          )}

         {/* Status Kehadiran (Gabungan Global & Custom) */}
<Grid size={{ xs: 12, md: 6 }}>
  <CustomFormLabel htmlFor="status_kehadiran_id" sx={{ mt: 1.85 }}>
    Status Kehadiran
  </CustomFormLabel>
  <CustomSelect
    id="status_kehadiran_id"
    name="status_kehadiran_id"
    value={formState.status_kehadiran_id}
    onChange={(e) => {
      const selectedId = e.target.value;
      const selectedStatus = statusOptions.find((s) => s.id === selectedId);

      setFormState((prevState) => ({
        ...prevState,
        status_kehadiran_id: selectedId,
        status_kehadiran: selectedStatus?.nama_status || "",
        jam_masuk: selectedStatus?.is_global ? prevState.jam_masuk : null,
        jam_pulang: selectedStatus?.is_global ? prevState.jam_pulang : null,
      }));
    }}
    fullWidth
    displayEmpty
    required
  >
    <MenuItem value="" disabled>Pilih Status Kehadiran</MenuItem>
    {statusOptions.map((statusOption) => (
      <MenuItem key={statusOption.id} value={statusOption.id}>
        {statusOption.nama_status}
      </MenuItem>
    ))}
  </CustomSelect>
</Grid>


          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="keterangan" sx={{ mt: 1.85 }}>Deskripsi</CustomFormLabel>
            <CustomTextField id="keterangan" name="keterangan" value={formState.keterangan} onChange={handleChange} fullWidth />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
          <SubmitButton isLoading={loading}>Simpan</SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </LocalizationProvider>
    </Box>
  );
};

export default AbsensiForm;

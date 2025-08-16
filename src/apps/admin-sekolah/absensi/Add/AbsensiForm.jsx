import { useState, useMemo } from "react";
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
      return response.data.data; // { id, nama_status, is_global }
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

  const normalizeStatusName = (name = '') => {
    const s = String(name).trim().toLowerCase();
    if (s === 'masuk' || s === 'hadir') return 'hadir';
    if (s === 'terlambat') return 'terlambat';
    if (s === 'izin') return 'izin';
    if (s === 'sakit') return 'sakit';
    if (s === 'alpa' || s === 'tanpa keterangan') return 'tanpa_keterangan';
    if (s === 'pulang') return 'pulang';
    return s;
  };

  const selectedStatus = useMemo(
    () => statusOptions.find((item) => item.id === formState.status_kehadiran_id),
    [statusOptions, formState.status_kehadiran_id]
  );

  // 🔧 Tentukan aturan per status
  const rules = useMemo(() => {
    const key = normalizeStatusName(selectedStatus?.nama_status || '');
    const isGlobal = !!selectedStatus?.is_global;

    // default: tidak boleh & tidak wajib
    let allowJamMasuk = false, allowJamPulang = false;
    let requireJamMasuk = false, requireJamPulang = false;

    if (!isGlobal) {
      // Izin / Sakit (custom) → tidak pakai jam
      return { allowJamMasuk, allowJamPulang, requireJamMasuk, requireJamPulang };
    }

    if (key === 'hadir' || key === 'terlambat' || key === 'masuk') {
      allowJamMasuk = true;   requireJamMasuk = true;   // WAJIB jam_masuk
      allowJamPulang = true;  requireJamPulang = false; // jam_pulang opsional
    } else if (key === 'pulang') {
      allowJamMasuk = false;  requireJamMasuk = false;
      allowJamPulang = true;  requireJamPulang = true;  // WAJIB jam_pulang
    } else if (key === 'tanpa_keterangan') {
      // Alpa / TK → tidak pakai jam
      allowJamMasuk = false;  requireJamMasuk = false;
      allowJamPulang = false; requireJamPulang = false;
    }

    return { allowJamMasuk, allowJamPulang, requireJamMasuk, requireJamPulang };
  }, [selectedStatus]);

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
    } else if (name === "status_kehadiran_id") {
      const nextSelected = statusOptions.find((s) => s.id === value);
      const key = normalizeStatusName(nextSelected?.nama_status || '');
      const isGlobal = !!nextSelected?.is_global;

      setFormState((prev) => {
        let jam_masuk = prev.jam_masuk;
        let jam_pulang = prev.jam_pulang;

        if (!isGlobal || key === 'izin' || key === 'sakit' || key === 'tanpa_keterangan') {
          // Kosongkan jam untuk Izin/Sakit/TK atau status custom
          jam_masuk = null;
          jam_pulang = null;
        } else if (key === 'pulang') {
          // Pulang → wajib jam_pulang, reset agar admin isi
          jam_pulang = null;
        }
        // Hadir/Terlambat: biarkan apa adanya (jam_pulang opsional)

        return {
          ...prev,
          status_kehadiran_id: value,
          jam_masuk,
          jam_pulang,
        };
      });
    } else {
      setFormState((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleDateChange = (date) =>
    setFormState((prevState) => ({ ...prevState, tanggal: date }));

  const handleTimeChange = (field, value) => {
    if (!value) {
      setFormState((prev) => ({ ...prev, [field]: null }));
      return;
    }
    const hh = value.getHours().toString().padStart(2, '0');
    const mm = value.getMinutes().toString().padStart(2, '0');
    setFormState((prevState) => ({ ...prevState, [field]: `${hh}.${mm}` }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formState.tanggal || !formState.status_kehadiran_id) {
      setError("Tanggal dan status kehadiran harus diisi");
      return;
    }

    // ✅ Validasi sesuai rules
    if (rules.requireJamMasuk && !formState.jam_masuk) {
      setError("Jam masuk wajib diisi untuk status ini");
      return;
    }
    if (rules.requireJamPulang && !formState.jam_pulang) {
      setError("Jam pulang wajib diisi untuk status ini");
      return;
    }

    setLoading(true);
    mutation.mutate(formState);
  };

  const handleCancel = () => navigate(-1);

  if (siswaError || statusError) return <div>Error Loading Data...</div>;

  const timeToDate = (val) =>
    val ? new Date(`1970-01-01T${String(val).replace('.', ':')}:00`) : null;

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
                <CustomTextField
                  {...params}
                  fullWidth
                  placeholder="Cari / Pilih nama siswa"
                  aria-label="Pilih nama siswa"
                  InputProps={{ ...params.InputProps, style: { height: 45 } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="nama_kelas" sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
            <CustomTextField id="nama_kelas" name="nama_kelas" value={formState.nama_kelas} fullWidth disabled />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="tanggal" sx={{ mt: 1.85 }}>Tanggal</CustomFormLabel>
            <DatePicker
              value={formState.tanggal || null}
              onChange={handleDateChange}
              placeholder="Masukkan Tanggal"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{ textField: { fullWidth: true, size: 'medium', required: true, InputProps: { sx: { height: '46px' } } } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="jam_masuk" sx={{ mt: 1.85 }}>Jam Masuk</CustomFormLabel>
            <TimePicker
              ampm={false}
              disableMaskedInput
              value={timeToDate(formState.jam_masuk)}
              onChange={(value) => handleTimeChange("jam_masuk", value)}
              disabled={!rules.allowJamMasuk}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{ textField: { fullWidth: true, size: "medium", required: rules.requireJamMasuk } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="jam_pulang" sx={{ mt: 1.85 }}>Jam Pulang</CustomFormLabel>
            <TimePicker
              ampm={false}
              disableMaskedInput
              value={timeToDate(formState.jam_pulang)}
              onChange={(value) => handleTimeChange("jam_pulang", value)}
              disabled={!rules.allowJamPulang}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{ textField: { fullWidth: true, size: "medium", required: rules.requireJamPulang } }}
            />
          </Grid>

          {/* Status Kehadiran (Gabungan Global & Custom) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="status_kehadiran_id" sx={{ mt: 1.85 }}>
              Status Kehadiran
            </CustomFormLabel>
            <CustomSelect
              id="status_kehadiran_id"
              name="status_kehadiran_id"
              value={formState.status_kehadiran_id}
              onChange={handleChange}
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

import {
    Box,
    InputAdornment,
    CircularProgress,
    MenuItem,
  } from "@mui/material";
  import Grid from "@mui/material/Grid";
  import { IconBuilding, IconUser } from "@tabler/icons-react";
  import { useQuery } from "@tanstack/react-query";
  import { LocalizationProvider } from "@mui/x-date-pickers";
  import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
  import { DatePicker, TimePicker } from "@mui/x-date-pickers";
  import SubmitButton from "src/components/button-group/SubmitButton";
  import CancelButton from "src/components/button-group/CancelButton";
  import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
  import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
  import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
  import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
  import axiosInstance from "src/utils/axiosInstance";
  
  const AbsensiEditForm = ({ absensiData, handleChange, handleSubmit, handleCancel, isLoading }) => {
    const { data: statusKehadiranOptions = [], isLoading: isStatusKehadiranLoading } = useQuery({
      queryKey: ["statusKehadiranOptions"],
      queryFn: async () => {
        const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/status-kehadiran");
        return response.data.data; // { id, nama_status, is_global, tipe_status? }
      },
    });
  
    const str = (v) => (v === null || v === undefined ? "" : String(v));
    const norm = (s) => str(s).trim().toLowerCase();
  
    // Cari status terpilih (id > nama)
    const selectedStatusId = str(absensiData.status_custom_id || absensiData.status_kehadiran_id);
    const selectedStatusById =
      statusKehadiranOptions.find((opt) => str(opt.id) === selectedStatusId) || null;
    const selectedStatusByName =
      statusKehadiranOptions.find(
        (opt) => norm(opt.nama_status) === norm(absensiData.status_kehadiran)
      ) || null;
    const selectedStatus = selectedStatusById || selectedStatusByName;
  
    const selectedName = norm(selectedStatus?.nama_status);
    const isCustomSelected = selectedStatus
      ? (!selectedStatus.is_global || ["izin", "sakit"].includes(selectedName))
      : ["izin", "sakit"].includes(norm(absensiData.status_kehadiran));
    const isPulangSelected = selectedStatus
      ? norm(selectedStatus.tipe_status) === "pulang" || selectedName === "pulang"
      : norm(absensiData.status_kehadiran) === "pulang";
  
    // RULES tampilan & validasi time picker
    const rules = {
      allowJamMasuk: false,            // jam masuk di edit form tetap read-only
      requireJamMasuk: false,
      allowJamPulang: isPulangSelected || isCustomSelected,
      requireJamPulang: isPulangSelected,
    };
  
    // Format "HH:mm:ss"
    const handleTimeChange = (field, value) => {
      if (value instanceof Date && !isNaN(value)) {
        const hh = String(value.getHours()).padStart(2, "0");
        const mm = String(value.getMinutes()).padStart(2, "0");
        const ss = String(value.getSeconds()).padStart(2, "0");
        handleChange({ target: { name: field, value: `${hh}:${mm}:${ss}` } });
      } else {
        handleChange({ target: { name: field, value: "" } });
      }
    };
  
    // Saat memilih status pada dropdown gabungan
    const onSelectStatus = (e) => {
      const id = e.target.value;
      const opt = statusKehadiranOptions.find((o) => str(o.id) === str(id));
  
      if (!opt) {
        handleChange({ target: { name: "status_kehadiran", value: "" } });
        handleChange({ target: { name: "status_kehadiran_id", value: "" } });
        handleChange({ target: { name: "status_custom_id", value: "" } });
        return;
      }
  
      handleChange({ target: { name: "status_kehadiran", value: opt.nama_status } });
      handleChange({ target: { name: "status_kehadiran_id", value: opt.is_global ? opt.id : "" } });
      handleChange({ target: { name: "status_custom_id", value: opt.is_global ? "" : opt.id } });
  
      // Jika berpindah dari Pulang → non-Pulang, kosongkan jam_pulang supaya tidak memicu required
      const optIsPulang = norm(opt.tipe_status) === "pulang" || norm(opt.nama_status) === "pulang";
      if (!optIsPulang) {
        handleChange({ target: { name: "jam_pulang", value: "" } });
      }
    };
  
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="40px">
          <CircularProgress />
        </Box>
      );
    }
  
    // Parse tanggal & waktu
    const tanggalValue = absensiData.tanggal ? new Date(absensiData.tanggal) : null;
    const timeToDate = (val) => {
      if (!val || val === "-") return null;
      const s = String(val);
      const t = s.includes(".") && !s.includes(":") ? s.replace(".", ":") : s;
      const withSec = t.length === 5 ? `${t}:00` : t; // HH:mm -> HH:mm:ss
      return new Date(`1970-01-01T${withSec}`);
    };
  
    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -5 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} rowSpacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
                Nama Siswa
              </CustomFormLabel>
              <CustomOutlinedInput
                id="nama"
                name="nama"
                value={absensiData.nama || "-"}
                startAdornment={
                  <InputAdornment position="start">
                    <IconUser />
                  </InputAdornment>
                }
                fullWidth
                readOnly
              />
            </Grid>
  
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="kelas" sx={{ mt: 1.85 }}>
                Kelas
              </CustomFormLabel>
              <CustomOutlinedInput
                id="kelas"
                name="kelas"
                value={absensiData.kelas || "-"}
                startAdornment={
                  <InputAdornment position="start">
                    <IconBuilding />
                  </InputAdornment>
                }
                fullWidth
                readOnly
              />
            </Grid>
  
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="tanggal" sx={{ mt: 1.85 }}>
                Tanggal
              </CustomFormLabel>
              <DatePicker
                value={tanggalValue}
                readOnly
                format="dd/MM/yyyy"
                enableAccessibleFieldDOMStructure={false}
                slots={{ textField: CustomTextField }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
  
            {/* Status Kehadiran (gabungan global & custom) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="status_select" sx={{ mt: 1.85 }}>
                Status Kehadiran
              </CustomFormLabel>
              <CustomSelect
                id="status_select"
                name="status_select"
                value={selectedStatus ? selectedStatus.id : ""}
                onChange={onSelectStatus}
                fullWidth
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Pilih Status
                </MenuItem>
                {isStatusKehadiranLoading ? (
                  <MenuItem value="">Memuat...</MenuItem>
                ) : (
                  statusKehadiranOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.nama_status}
                    </MenuItem>
                  ))
                )}
              </CustomSelect>
            </Grid>
  
            {/* Jam Masuk – tampilan & props sesuai pola yang diminta */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="jam_masuk" sx={{ mt: 1.85 }}>
                Jam Masuk
              </CustomFormLabel>
              <TimePicker
                ampm={false}
                disableMaskedInput
                value={timeToDate(absensiData.jam_masuk)}
                onChange={(value) => handleTimeChange("jam_masuk", value)}
                disabled={!rules.allowJamMasuk}
                desktopModeMediaQuery="@media (min-width:9999px)"
                enableAccessibleFieldDOMStructure={false}
                slots={{ textField: CustomTextField }}
                slotProps={{
                  textField: { fullWidth: true, size: "medium", required: rules.requireJamMasuk },
                }}
              />
            </Grid>
  
            {/* Jam Pulang – aktif untuk Pulang atau Izin/Sakit; wajib hanya Pulang */}
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="jam_pulang" sx={{ mt: 1.85 }}>
                Jam Pulang{rules.requireJamPulang ? " (wajib)" : ""}
              </CustomFormLabel>
              <TimePicker
                ampm={false}
                disableMaskedInput
                value={timeToDate(absensiData.jam_pulang)}
                onChange={(value) => handleTimeChange("jam_pulang", value)}
                disabled={!rules.allowJamPulang}
                desktopModeMediaQuery="@media (min-width:9999px)"
                enableAccessibleFieldDOMStructure={false}
                slots={{ textField: CustomTextField }}
                slotProps={{
                  textField: { fullWidth: true, size: "medium", required: rules.requireJamPulang },
                }}
              />
            </Grid>
  
            {/* Deskripsi */}
            <Grid size={{ xs: 12, md: 12 }}>
              <CustomFormLabel htmlFor="keterangan" sx={{ mt: 1.85 }}>
                Deskripsi
              </CustomFormLabel>
              <CustomTextField
                fullWidth
                name="keterangan"
                value={absensiData.keterangan || ""}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
  
        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}>
          <SubmitButton type="submit">Simpan</SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    );
  };
  
  export default AbsensiEditForm;
  
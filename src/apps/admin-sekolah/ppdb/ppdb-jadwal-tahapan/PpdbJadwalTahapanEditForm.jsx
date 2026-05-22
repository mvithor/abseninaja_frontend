import Grid from "@mui/material/Grid";
import { Box, CircularProgress, MenuItem, InputAdornment, FormControlLabel, Switch } from "@mui/material";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import {
  IconBox,
  IconFileText,
  IconCalendarTime,
  IconClock,
  IconListNumbers,
  IconMapPin,
  IconNotes,
  IconSwitch,
} from "@tabler/icons-react";

const TypographyNote = ({ text }) => {
  if (!text) return null;
  return (
    <Box sx={{ mt: 0.75 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: "action.hover",
        }}
      >
        <IconBox size={16} />
        <span style={{ fontSize: 12, opacity: 0.9 }}>{text}</span>
      </Box>
    </Box>
  );
};

const toDayjs = (val) => {
  if (!val) return null;
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

const mergeDateTimeToIso = (dateVal, timeVal) => {
  if (!dateVal && !timeVal) return "";

  const base =
    dateVal && dateVal.isValid()
      ? dateVal
      : timeVal && timeVal.isValid()
        ? timeVal
        : null;

  if (!base) return "";

  const y = base.year();
  const m = base.month();
  const d = base.date();

  const tBase = timeVal && timeVal.isValid() ? timeVal : base;
  const hh = tBase.hour();
  const mm = tBase.minute();

  const merged = dayjs()
    .year(y)
    .month(m)
    .date(d)
    .hour(hh)
    .minute(mm)
    .second(0)
    .millisecond(0);

  return merged.isValid() ? merged.toISOString() : "";
};

const PICKER_TEXTFIELD_PROPS = {
  fullWidth: true,
  variant: "outlined",
  size: "medium",
  InputProps: {
    sx: {
      height: "46px",
      paddingHorizontal: 0,
    },
  },
};

const AttachAndSanitizeNumber = (val) => {
  return String(val ?? "").replace(/[^\d]/g, "");
};

const PpdbJadwalTahapanEditForm = ({
  formData,
  setFormData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  // ===================== Dropdown Options =====================
  const { data: periodOptions = [], isLoading: isPeriodLoading } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-period");
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows
        .filter((p) => String(p?.status || "").toUpperCase() !== "ARCHIVED")
        .map((p) => ({
          id: p.id,
          nama: p.nama,
          status: p.status,
          tahun_ajaran: p?.tahun_ajaran || "-",
        }));
    },
    refetchOnWindowFocus: false,
  });

  const { data: eventTypeOptions = [], isLoading: isEventTypeLoading } = useQuery({
    queryKey: ["ppdbEventTypeDropdown", formData.ppdb_period_id],
    enabled: Boolean(formData.ppdb_period_id),
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("is_active", "true");
      qs.set("limit", "200");
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-tahapan?${qs.toString()}`);

      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows.map((t) => ({
        id: t.id,
        code: t.code,
        nama: t.nama,
      }));
    },
    refetchOnWindowFocus: false,
  });

  const { data: waveTrackOptions = [], isLoading: isWaveTrackLoading } = useQuery({
    queryKey: ["ppdbWaveTrackOptions", formData.ppdb_period_id],
    enabled: Boolean(formData.ppdb_period_id),
    queryFn: async () => {
      const q = formData.ppdb_period_id
        ? `?ppdb_period_id=${encodeURIComponent(formData.ppdb_period_id)}`
        : "";
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-wave-track${q}`);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows
        .filter((wt) => wt?.is_open !== false)
        .map((wt) => ({
          id: wt.id,
          ppdb_wave_id: wt.ppdb_wave_id,
          ppdb_track_id: wt.ppdb_track_id,
          wave_nama: wt?.wave_nama || wt?.Wave?.nama || "-",
          track_nama: wt?.track_nama || wt?.Track?.nama || "-",
          track_kode: wt?.track_kode || wt?.Track?.kode || "",
          is_open: wt.is_open,
        }));
    },
    refetchOnWindowFocus: false,
  });

  const isAnyLoading =
    isLoading ||
    isPeriodLoading ||
    isEventTypeLoading ||
    isWaveTrackLoading;

  if (isAnyLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  const selectedWaveTrack = formData.ppdb_wave_track_id
    ? waveTrackOptions.find((x) => String(x.id) === String(formData.ppdb_wave_track_id)) || null
    : null;

  // ===================== Date/Time Split =====================
  const startDT = toDayjs(formData.start_at);
  const endDT = toDayjs(formData.end_at);

  const startDate = startDT ? startDT.startOf("day") : null;
  const startTime = startDT ? startDT : null;

  const endDate = endDT ? endDT.startOf("day") : null;
  const endTime = endDT ? endDT : null;

  const emitChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 1.85 }}>
              PMB Period
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_period_id"
              name="ppdb_period_id"
              value={formData.ppdb_period_id || ""}
              onChange={(e) => {
                const { value } = e.target;

                setFormData((prev) => ({
                  ...prev,
                  ppdb_period_id: value,

                  // reset dependents
                  ppdb_event_type_id: "",
                  ppdb_wave_track_id: "",
                }));
              }}
              fullWidth
              required
              displayEmpty
              inputProps={{ "aria-label": "Pilih PMB Period" }}
              MenuProps={{
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
                PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
              }}
              startAdornment={
                <InputAdornment position="start">
                  <IconBox />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Pilih PMB Period
              </MenuItem>
              {periodOptions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nama} — {p.tahun_ajaran} ({String(p.status || "").toUpperCase()})
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_event_type_id" sx={{ mt: 1.85 }}>
              Tahapan
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_event_type_id"
              name="ppdb_event_type_id"
              value={formData.ppdb_event_type_id || ""}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={!formData.ppdb_period_id}
              inputProps={{ "aria-label": "Pilih Tahapan" }}
              MenuProps={{
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
                PaperProps: { style: { maxHeight: 300, overflowY: "auto" } },
              }}
              startAdornment={
                <InputAdornment position="start">
                  <IconFileText />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Pilih Tahapan
              </MenuItem>
              {eventTypeOptions.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nama} {t.code ? `— ${String(t.code)}` : ""}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <CustomFormLabel htmlFor="ppdb_wave_track_id" sx={{ mt: 1.85 }}>
              Pilih Gelombang dan Jalur
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_wave_track_id"
              name="ppdb_wave_track_id"
              value={formData.ppdb_wave_track_id || ""}
              onChange={(e) => {
                const nextId = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  ppdb_wave_track_id: nextId,
                }));
              }}
              fullWidth
              displayEmpty
              disabled={!formData.ppdb_period_id}
              inputProps={{ "aria-label": "Pilih Mapping Gelombang-Jalur" }}
              MenuProps={{
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
                PaperProps: { style: { maxHeight: 320, overflowY: "auto" } },
              }}
              startAdornment={
                <InputAdornment position="start">
                  <IconBox />
                </InputAdornment>
              }
            >
              <MenuItem value="">
                Semua Jalur & Gelombang
              </MenuItem>
              {waveTrackOptions.map((wt) => (
                <MenuItem key={wt.id} value={wt.id}>
                  {wt.wave_nama} • {wt.track_nama} {wt.track_kode ? `(${wt.track_kode})` : ""}
                </MenuItem>
              ))}
            </CustomSelect>

            {selectedWaveTrack ? (
              <TypographyNote
                text={`Terpilih: ${selectedWaveTrack.wave_nama} • ${selectedWaveTrack.track_nama}${
                  selectedWaveTrack.track_kode ? ` (${selectedWaveTrack.track_kode})` : ""
                }`}
              />
            ) : (
              <TypographyNote text="Kosongkan jika tahapan berlaku untuk semua gelombang & semua jalur pada period ini." />
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="sequence" sx={{ mt: 1.85 }}>
              Urutan Tampilan
            </CustomFormLabel>
            <CustomOutlinedInput
              id="sequence"
              name="sequence"
              value={formData.sequence || ""}
              onChange={(e) => {
                const cleaned = AttachAndSanitizeNumber(e.target.value);
                setFormData((prev) => ({ ...prev, sequence: cleaned }));
              }}
              placeholder="Contoh: 1"
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              fullWidth
              inputMode="numeric"
            />
            <TypographyNote text="Jika dikosongkan, sistem akan gunakan default urutan 1 " />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Status 
            </CustomFormLabel>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "46px",
                px: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={Boolean(formData.is_active)}
                    onChange={(e) => emitChange("is_active", e.target.checked)}
                    icon={<IconSwitch />}
                  />
                }
                label={formData.is_active ? "AKTIF" : "NONAKTIF"}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="title" sx={{ mt: 1.85 }}>
              Judul Jadwal Tahapan
            </CustomFormLabel>
            <CustomOutlinedInput
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Contoh: Pendaftaran Gelombang 1"
              startAdornment={
                <InputAdornment position="start">
                  <IconFileText />
                </InputAdornment>
              }
              fullWidth
            />
          </Grid>

          {/* START: DATE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Tanggal Mulai
            </CustomFormLabel>

            <DatePicker
              value={startDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, startTime);
                emitChange("start_at", iso);
              }}
              format="DD MMM YYYY"
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih tanggal mulai",
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendarTime />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Grid>

          {/* START: TIME */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Jam Mulai
            </CustomFormLabel>

            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={startTime}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(startDate || val, val);
                emitChange("start_at", iso);
              }}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih jam mulai",
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconClock />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Grid>

          {/* END: DATE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Tanggal Selesai
            </CustomFormLabel>

            <DatePicker
              value={endDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, endTime);
                emitChange("end_at", iso);
              }}
              format="DD MMM YYYY"
              minDate={startDate || undefined}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih tanggal selesai",
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendarTime />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Grid>

          {/* END: TIME */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Jam Selesai
            </CustomFormLabel>

            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={endTime}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(endDate || val, val);
                emitChange("end_at", iso);
              }}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih jam selesai",
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconClock />
                      </InputAdornment>
                    ),
                  },
                },
              }}
              minTime={
                startDT && endDate && startDate && endDate.isSame(startDate, "day")
                  ? startDT
                  : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="location" sx={{ mt: 1.85 }}>
              Lokasi (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="Contoh: Aula Sekolah / Online"
              startAdornment={
                <InputAdornment position="start">
                  <IconMapPin />
                </InputAdornment>
              }
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="description" sx={{ mt: 1.85 }}>
              Deskripsi (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Catatan singkat untuk admin/panitia"
              startAdornment={
                <InputAdornment position="start">
                  <IconNotes />
                </InputAdornment>
              }
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
          <SubmitButton type="submit" isLoading={isLoading}>
            Simpan
          </SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PpdbJadwalTahapanEditForm;

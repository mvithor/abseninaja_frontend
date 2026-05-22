import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Switch,
  MenuItem,
} from "@mui/material";
import {
  IconBox,
  IconSwitch,
  IconSettings,
  IconCircuitSwitchOpen,
  IconForms,
  IconLink,
  IconCalendarTime,
  IconClock,
  IconListNumbers,
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const toDayjs = (val) => {
  if (!val) return null;
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

const mergeDateTimeToIso = (dateVal, timeVal) => {
  if (!dateVal && !timeVal) return "";

  const base = dateVal && dateVal.isValid()
    ? dateVal
    : (timeVal && timeVal.isValid() ? timeVal : null);

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

function AttachAndSanitizeInt(val) {
  return String(val ?? "").replace(/[^\d]/g, "");
}

const PpdbSesiJadwalEditForm = ({
  formData,
  periodOptions,
  waveTrackOptions,
  componentOptions,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  const sessionStatus = safeUpper(formData?.status || "");
  const periodStatus = safeUpper(formData?.PpdbPeriod?.status || "");
  const isArchived = periodStatus === "ARCHIVED";

  const isDraft = sessionStatus === "DRAFT";
  const disableAll = !isDraft || isArchived;

  const emitChange = (name, value) => {
    handleChange({ target: { name, value } });
  };

  const startDT = toDayjs(formData?.start_at);
  const endDT = toDayjs(formData?.end_at);

  const startDate = startDT ? startDT.startOf("day") : null;
  const startTime = startDT ? startDT : null;

  const endDate = endDT ? endDT.startOf("day") : null;
  const endTime = endDT ? endDT : null;

  const checkinOpenDT = toDayjs(formData?.checkin_open_at);
  const checkinCloseDT = toDayjs(formData?.checkin_close_at);
  const lateAfterDT = toDayjs(formData?.late_after_at);

  const checkinOpenDate = checkinOpenDT ? checkinOpenDT.startOf("day") : null;
  const checkinOpenTime = checkinOpenDT ? checkinOpenDT : null;

  const checkinCloseDate = checkinCloseDT ? checkinCloseDT.startOf("day") : null;
  const checkinCloseTime = checkinCloseDT ? checkinCloseDT : null;

  const lateAfterDate = lateAfterDT ? lateAfterDT.startOf("day") : null;
  const lateAfterTime = lateAfterDT ? lateAfterDT : null;

  const modeUpper = safeUpper(formData?.mode || "OFFLINE");
  const needUrl = modeUpper === "ONLINE" || modeUpper === "HYBRID";

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" height={40}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 1.85 }}>
              Periode PMB
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_period_id"
              name="ppdb_period_id"
              value={formData.ppdb_period_id || ""}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={disableAll}
              inputProps={{ "aria-label": "Pilih Periode PMB" }}
              startAdornment={
                <InputAdornment position="start">
                  <IconBox />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Pilih Periode PMB
              </MenuItem>
              {periodOptions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nama} — {p.tahun_ajaran} ({safeUpper(p.status)})
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Scope Sesi Gelombang dan Jalur</CustomFormLabel>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "46px",
                px: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={Boolean(formData.is_global_scope)}
                    onChange={(e) => emitChange("is_global_scope", e.target.checked)}
                    icon={<IconSwitch />}
                    disabled={disableAll}
                  />
                }
                label={formData?.is_global_scope ? "GLOBAL (Semua Gelombang & Jalur)" : "SPESIFIK (WaveTrack)"}
              />
            </Box>
          </Grid>

          {/* WaveTrack (opsional kalau global) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_wave_track_id" sx={{ mt: 1.85 }}>
              Jalur per Gelombang
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_wave_track_id"
              name="ppdb_wave_track_id"
              value={formData.ppdb_wave_track_id || ""}
              onChange={handleChange}
              fullWidth
              displayEmpty
              disabled={disableAll || !formData.ppdb_period_id || Boolean(formData.is_global_scope)}
              inputProps={{ "aria-label": "Pilih Gelombang dan Jalur" }}
              startAdornment={
                <InputAdornment position="start">
                  <IconSettings />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                {formData.is_global_scope ? "Scope GLOBAL aktif" : "Pilih Gelombang dan Jalur"}
              </MenuItem>
              {waveTrackOptions.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_test_component_id" sx={{ mt: 1.85 }}>
              Komponen Tes PMB
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_test_component_id"
              name="ppdb_test_component_id"
              value={formData.ppdb_test_component_id || ""}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={disableAll || !formData.ppdb_period_id}
              inputProps={{ "aria-label": "Pilih Komponen Tes PMB" }}
              startAdornment={
                <InputAdornment position="start">
                  <IconCircuitSwitchOpen />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Pilih Komponen Tes PMB
              </MenuItem>
              {componentOptions
                .filter((c) => c?.is_active !== false)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nama} ({safeUpper(c.type)})
                  </MenuItem>
                ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="title" sx={{ mt: 1.85 }}>
              Judul Sesi Jadwal Tes PMB
            </CustomFormLabel>
            <CustomOutlinedInput
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              placeholder="Contoh: Tes Matematika Gelombang 1"
              startAdornment={
                <InputAdornment position="start">
                  <IconForms />
                </InputAdornment>
              }
              fullWidth
              disabled={disableAll}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="capacity" sx={{ mt: 1.85 }}>
              Kapasitas (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="capacity"
              name="capacity"
              value={formData.capacity ?? ""}
              onChange={(e) => emitChange("capacity", AttachAndSanitizeInt(e.target.value))}
              placeholder="Contoh: 30"
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              fullWidth
              inputMode="numeric"
              disabled={disableAll}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="mode" sx={{ mt: 1.85 }}>
              Mode
            </CustomFormLabel>
            <CustomSelect
              id="mode"
              name="mode"
              value={formData.mode || "OFFLINE"}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={disableAll}
              inputProps={{ "aria-label": "Pilih Mode" }}
              startAdornment={
                <InputAdornment position="start">
                  <IconSwitch />
                </InputAdornment>
              }
            >
              <MenuItem value="OFFLINE">OFFLINE</MenuItem>
              <MenuItem value="ONLINE">ONLINE</MenuItem>
              <MenuItem value="HYBRID">HYBRID</MenuItem>
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="online_url" sx={{ mt: 1.85 }}>
              Link Online {needUrl ? "(Wajib)" : "(Opsional)"}
            </CustomFormLabel>
            <CustomOutlinedInput
              id="online_url"
              name="online_url"
              value={formData.online_url || ""}
              onChange={handleChange}
              placeholder="Contoh: https://meet.google.com/xxx-xxxx-xxx"
              startAdornment={
                <InputAdornment position="start">
                  <IconLink />
                </InputAdornment>
              }
              fullWidth
              disabled={disableAll || modeUpper === "OFFLINE"}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Tanggal Mulai</CustomFormLabel>
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
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendarTime />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jam Mulai</CustomFormLabel>
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
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconClock />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Tanggal Selesai</CustomFormLabel>
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
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendarTime />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jam Selesai</CustomFormLabel>
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
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconClock />
                      </InputAdornment>
                    ),
                  },
                }
              }}
              minTime={
                startDT && endDate && startDate && endDate.isSame(startDate, "day")
                  ? startDT
                  : undefined
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Tanggal Check-in Dibuka (Opsional)</CustomFormLabel>
            <DatePicker
              value={checkinOpenDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, checkinOpenTime);
                emitChange("checkin_open_at", iso);
              }}
              format="DD MMM YYYY"
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih tanggal check-in dibuka",
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendarTime />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jam Check-in Dibuka (Opsional)</CustomFormLabel>
            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={checkinOpenTime}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(checkinOpenDate || val, val);
                emitChange("checkin_open_at", iso);
              }}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih jam check-in dibuka",
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconClock />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Tanggal Terlambat Setelah (Opsional)</CustomFormLabel>
            <DatePicker
              value={lateAfterDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, lateAfterTime);
                emitChange("late_after_at", iso);
              }}
              format="DD MMM YYYY"
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih tanggal late",
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendarTime />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jam Terlambat Setelah (Opsional)</CustomFormLabel>
            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={lateAfterTime}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(lateAfterDate || val, val);
                emitChange("late_after_at", iso);
              }}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih jam late",
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconClock />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Tanggal Check-in Ditutup (Opsional)</CustomFormLabel>
            <DatePicker
              value={checkinCloseDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, checkinCloseTime);
                emitChange("checkin_close_at", iso);
              }}
              format="DD MMM YYYY"
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih tanggal check-in ditutup",
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendarTime />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jam Check-in Ditutup (Opsional)</CustomFormLabel>
            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={checkinCloseTime}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(checkinCloseDate || val, val);
                emitChange("checkin_close_at", iso);
              }}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih jam check-in ditutup",
                  disabled: disableAll,
                  InputProps: {
                    ...PICKER_TEXTFIELD_PROPS.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconClock />
                      </InputAdornment>
                    ),
                  },
                }
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <SubmitButton disabled={disableAll}>Simpan</SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PpdbSesiJadwalEditForm;
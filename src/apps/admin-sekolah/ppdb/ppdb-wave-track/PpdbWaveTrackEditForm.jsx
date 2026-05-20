// src/apps/admin-sekolah/ppdb/ppdb-wave-track/PpdbWaveTrackEditForm.js
import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography
} from "@mui/material";
import {
  IconCalendarTime,
  IconClock,
  IconListNumbers,
  IconToggleRight
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const toDayjs = (val) => {
  if (!val) return null;
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

const mergeDateTimeToIso = (dateVal, timeVal) => {
  if (!dateVal && !timeVal) return "";

  const base = dateVal?.isValid()
    ? dateVal
    : timeVal?.isValid()
      ? timeVal
      : null;

  if (!base) return "";

  const merged = dayjs()
    .year(base.year())
    .month(base.month())
    .date(base.date())
    .hour(timeVal?.hour() ?? base.hour())
    .minute(timeVal?.minute() ?? base.minute())
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

const PpdbWaveTrackEditForm = ({
  waveTrackData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  // Kalau period ARCHIVED, backend akan menolak update.
  // FE: disable jika status period ARCHIVED.
  const periodStatus = String(waveTrackData?.Wave?.PpdbPeriod?.status || "").toUpperCase();
  const isArchived = periodStatus === "ARCHIVED";

  const openDT = toDayjs(waveTrackData.open_at);
  const closeDT = toDayjs(waveTrackData.close_at);

  const openDate = openDT ? openDT.startOf("day") : null;
  const openTime = openDT || null;

  const closeDate = closeDT ? closeDT.startOf("day") : null;
  const closeTime = closeDT || null;

  const emitChange = (name, value) => {
    handleChange({ target: { name, value } });
  };

  // Hindari redundant Boolean() call (dipakai sekali saja)
  const isOpenChecked = Boolean(waveTrackData?.is_open);

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
            <CustomFormLabel sx={{ mt: 1.85 }}>Gelombang</CustomFormLabel>
            <CustomOutlinedInput
              name="wave_name"
              value={waveTrackData?.Wave?.nama || "-"}
              fullWidth
              readOnly
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jalur</CustomFormLabel>
            <CustomOutlinedInput
              name="track_name"
              value={
                waveTrackData?.Track?.kode
                  ? `${waveTrackData?.Track?.kode} - ${waveTrackData?.Track?.nama || ""}`
                  : waveTrackData?.Track?.nama || "-"
              }
              fullWidth
              readOnly
            />
          </Grid>

          {/* Open/Close Toggle (dibungkus seragam) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Status Jalur di Gelombang
            </CustomFormLabel>

            <Box
              sx={{
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                px: 1.25,
                gap: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <IconToggleRight size={20} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {isOpenChecked ? "Dibuka" : "Ditutup"}
                </Typography>
              </Box>

              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={isOpenChecked}
                    onChange={(e) => emitChange("is_open", e.target.checked)}
                    disabled={isArchived}
                  />
                }
                label=""
              />
            </Box>
          </Grid>

          {/* Sort Order */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Urutan Tampil</CustomFormLabel>
            <CustomOutlinedInput
              name="sort_order"
              value={waveTrackData.sort_order ?? ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              inputMode="numeric"
              disabled={isArchived}
              fullWidth
            />
          </Grid>

          {/* Kuota */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Kuota Jalur (Override)</CustomFormLabel>
            <CustomOutlinedInput
              name="quota"
              value={waveTrackData.quota ?? ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              inputMode="numeric"
              disabled={isArchived}
              fullWidth
              placeholder="Kosongkan jika mengikuti kuota global/aturan lainnya"
            />
          </Grid>

          {/* Open Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Tanggal Buka Jalur (Override)</CustomFormLabel>
            <DatePicker
              value={openDate}
              onChange={(val) => emitChange("open_at", mergeDateTimeToIso(val, openTime))}
              disabled={isArchived}
              format="DD MMM YYYY"
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih tanggal buka",
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

          {/* Open Time (modern) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jam Buka Jalur (Override)</CustomFormLabel>
            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={openTime}
              onChange={(val) => emitChange("open_at", mergeDateTimeToIso(openDate || val, val))}
              disabled={isArchived}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih jam buka",
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

          {/* Close Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Tanggal Tutup Jalur (Override)</CustomFormLabel>
            <DatePicker
              value={closeDate}
              onChange={(val) => emitChange("close_at", mergeDateTimeToIso(val, closeTime))}
              minDate={openDate || undefined}
              disabled={isArchived}
              format="DD MMM YYYY"
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih tanggal tutup",
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

          {/* Close Time (modern) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jam Tutup Jalur (Override)</CustomFormLabel>
            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={closeTime}
              onChange={(val) => emitChange("close_at", mergeDateTimeToIso(closeDate || val, val))}
              disabled={isArchived}
              desktopModeMediaQuery="@media (min-width:9999px)"
              enableAccessibleFieldDOMStructure={false}
              slotProps={{
                textField: {
                  ...PICKER_TEXTFIELD_PROPS,
                  placeholder: "Pilih jam tutup",
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
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <SubmitButton disabled={isArchived}>Simpan</SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PpdbWaveTrackEditForm;
import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  IconFileText,
  IconCalendarTime,
  IconClock,
  IconListNumbers
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

const upper = (v) => String(v || "").trim().toUpperCase();

const toDayjs = (val) => {
  if (!val) return null;
  const d = dayjs(val);
  return d.isValid() ? d : null;
};

const mergeDateTimeToIso = (dateVal, timeVal) => {
  // dateVal & timeVal: dayjs|null
  if (!dateVal && !timeVal) return "";

  const base = dateVal?.isValid()
    ? dateVal
    : timeVal?.isValid()
      ? timeVal
      : null;

  if (!base) return "";

  const y = base.year();
  const m = base.month();
  const d = base.date();

  const tBase = timeVal?.isValid() ? timeVal : base;
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

const PpdbWaveEditForm = ({
  waveData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading
}) => {
  const status = upper(waveData?.status);
  const isDraft = status === "DRAFT";

  const openDT = toDayjs(waveData?.open_at);
  const closeDT = toDayjs(waveData?.close_at);

  const openDate = openDT ? openDT.startOf("day") : null;
  const openTime = openDT ? openDT : null;

  const closeDate = closeDT ? closeDT.startOf("day") : null;
  const closeTime = closeDT ? closeDT : null;

  const emitChange = (name, value) => {
    handleChange({
      target: {
        name,
        value
      }
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
        {!isDraft && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Gelombang dengan status <b>{status || "-"}</b> tidak dapat diedit.
          </Alert>
        )}

        <Grid container spacing={2} rowSpacing={1}>
          {/* Nama Gelombang */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Nama Gelombang
            </CustomFormLabel>
            <CustomOutlinedInput
              name="nama"
              value={waveData?.nama || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                  <IconFileText />
                </InputAdornment>
              }
              fullWidth
              required
              disabled={!isDraft}
            />
          </Grid>

          {/* Kuota */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Kuota Global
            </CustomFormLabel>
            <CustomOutlinedInput
              name="quota_global"
              value={waveData?.quota_global ?? ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              inputMode="numeric"
              disabled={!isDraft}
              fullWidth
            />
          </Grid>

          {/* OPEN: DATE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Tanggal Buka
            </CustomFormLabel>

            <DatePicker
              value={openDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, openTime);
                emitChange("open_at", iso);
              }}
              format="DD MMM YYYY"
              disabled={!isDraft}
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
                }
              }}
            />
          </Grid>

          {/* OPEN: TIME */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Jam Buka
            </CustomFormLabel>

            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={openTime}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(openDate || val, val);
                emitChange("open_at", iso);
              }}
              disabled={!isDraft}
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
                }
              }}
            />
          </Grid>

          {/* CLOSE: DATE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Tanggal Tutup
            </CustomFormLabel>

            <DatePicker
              value={closeDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, closeTime);
                emitChange("close_at", iso);
              }}
              format="DD MMM YYYY"
              minDate={openDate || undefined}
              disabled={!isDraft}
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
                }
              }}
            />
          </Grid>

          {/* CLOSE: TIME */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Jam Tutup
            </CustomFormLabel>

            <TimePicker
              ampm={false}
              timeSteps={{ minutes: 5 }}
              value={closeTime}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(closeDate || val, val);
                emitChange("close_at", iso);
              }}
              disabled={!isDraft}
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
                }
              }}
              minTime={
                openDT && closeDate && openDate && closeDate.isSame(openDate, "day")
                  ? openDT
                  : undefined
              }
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
          <SubmitButton type="submit" disabled={!isDraft}>
            Simpan
          </SubmitButton>
          <CancelButton onClick={handleCancel}>
            Batal
          </CancelButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PpdbWaveEditForm;
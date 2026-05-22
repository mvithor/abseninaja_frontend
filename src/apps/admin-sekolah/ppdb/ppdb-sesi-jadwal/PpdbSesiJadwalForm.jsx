import Grid from "@mui/material/Grid";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import {
  IconBox,
  IconListNumbers,
  IconSwitch,
  IconClock,
  IconLink,
  IconForms,
  IconCategory2,
  IconMapPin,
  IconCalendarTime,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const safeText = (val) => {
  const s = String(val ?? "").trim();
  return s.length > 0 ? s : "";
};

const AttachAndSanitizeNumber = (val) => {
  return String(val ?? "").replace(/[^\d]/g, "");
};

const toIntOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const i = parseInt(String(n), 10);
  if (Number.isNaN(i)) return null;
  return i;
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

const TambahPpdbSesiJadwalForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefillPeriodId = searchParams.get("ppdb_period_id") || "";
  const prefillWaveTrackId = searchParams.get("ppdb_wave_track_id") || "";
  const prefillComponentId = searchParams.get("ppdb_test_component_id") || "";
  const prefillMode = searchParams.get("mode") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: prefillPeriodId,
    is_global_scope: !prefillWaveTrackId,
    ppdb_wave_track_id: prefillWaveTrackId,
    ppdb_test_component_id: prefillComponentId,

    title: "",
    mode: prefillMode ? String(prefillMode).toUpperCase() : "OFFLINE",
    online_url: "",

    start_at: "",
    end_at: "",

    checkin_open_at: "",
    late_after_at: "",
    checkin_close_at: "",

    capacity: "",
  });

  const emitChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (formState.is_global_scope) {
      if (formState.ppdb_wave_track_id) emitChange("ppdb_wave_track_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.is_global_scope]);

  const startDT = toDayjs(formState.start_at);
  const endDT = toDayjs(formState.end_at);

  const startDate = startDT ? startDT.startOf("day") : null;
  const startTime = startDT ? startDT : null;

  const endDate = endDT ? endDT.startOf("day") : null;
  const endTime = endDT ? endDT : null;

  const checkinOpenDT = toDayjs(formState.checkin_open_at);
  const lateAfterDT = toDayjs(formState.late_after_at);
  const checkinCloseDT = toDayjs(formState.checkin_close_at);

  const checkinOpenDate = checkinOpenDT ? checkinOpenDT.startOf("day") : null;
  const checkinOpenTime = checkinOpenDT ? checkinOpenDT : null;

  const lateAfterDate = lateAfterDT ? lateAfterDT.startOf("day") : null;
  const lateAfterTime = lateAfterDT ? lateAfterDT : null;

  const checkinCloseDate = checkinCloseDT ? checkinCloseDT.startOf("day") : null;
  const checkinCloseTime = checkinCloseDT ? checkinCloseDT : null;

  // ===================== DROPDOWNS =====================

  const { data: periodOptions = [] } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-period");
      return response.data?.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const { data: waveTrackOptions = [] } = useQuery({
    queryKey: ["ppdbWaveTrackOptions", formState.ppdb_period_id],
    enabled: Boolean(formState.ppdb_period_id),
    queryFn: async () => {
      const q = formState.ppdb_period_id
        ? `?ppdb_period_id=${encodeURIComponent(formState.ppdb_period_id)}`
        : "";
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-wave-track${q}`);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];

      return rows.map((r) => {
        const wave = r?.wave_nama || "-";
        const track = r?.track_nama || "-";
        const kode = r?.track_kode ? ` (${String(r.track_kode)})` : "";
        const open = r?.is_open === true ? "OPEN" : r?.is_open === false ? "CLOSED" : "-";
        const waveStatus = r?.wave_status ? String(r.wave_status).toUpperCase() : "-";

        return {
          id: r.id,
          label: `${wave} [${waveStatus}] — ${track}${kode} — ${open}`,
        };
      });
    },
    refetchOnWindowFocus: false,
  });

  const { data: componentOptions = [] } = useQuery({
    queryKey: ["ppdbTestComponentOptions", formState.ppdb_period_id],
    enabled: Boolean(formState.ppdb_period_id),
    queryFn: async () => {
      const q = formState.ppdb_period_id
        ? `?ppdb_period_id=${encodeURIComponent(formState.ppdb_period_id)}`
        : "";
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-komponen-tes${q}`);
      return response.data?.data || [];
    },
    refetchOnWindowFocus: false,
  });

  // ===================== VALIDATION =====================

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!formState.ppdb_test_component_id) return false;

    if (!formState.is_global_scope && !formState.ppdb_wave_track_id) return false;

    const title = safeText(formState.title);
    if (title.length < 3) return false;

    const mode = String(formState.mode || "").toUpperCase();
    if (!["OFFLINE", "ONLINE", "HYBRID"].includes(mode)) return false;

    if ((mode === "ONLINE" || mode === "HYBRID") && !safeText(formState.online_url)) return false;

    // start/end wajib
    const startIso = safeText(formState.start_at);
    const endIso = safeText(formState.end_at);
    if (!startIso || !endIso) return false;

    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    if (!Number.isFinite(s) || !Number.isFinite(e) || s >= e) return false;
    const capRaw = safeText(formState.capacity);
    if (capRaw) {
      const cap = toIntOrNull(capRaw);
      if (cap === null || cap < 1) return false;
    }

    const openIso = safeText(formState.checkin_open_at);
    const lateIso = safeText(formState.late_after_at);
    const closeIso = safeText(formState.checkin_close_at);

    const open = openIso ? new Date(openIso).getTime() : null;
    const late = lateIso ? new Date(lateIso).getTime() : null;
    const close = closeIso ? new Date(closeIso).getTime() : null;

    if (open && close && open > close) return false;
    if (open && late && open > late) return false;
    if (late && close && late > close) return false;

    return true;
  }, [formState]);

  // ===================== MUTATION =====================

  const mutation = useMutation({
    mutationKey: ["tambahPpdbSesiJadwal"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb-sesi-jadwal", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      setSuccess(data?.msg || "Sesi / Jadwal Tes berhasil ditambahkan");
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["ppdb-sesi-jadwal"] });
      setTimeout(() => navigate(-1), 300);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan";
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
    onSettled: () => setLoading(false),
  });

  // ===================== HANDLERS =====================

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "capacity") {
      const cleaned = AttachAndSanitizeNumber(value);
      emitChange(name, cleaned);
      return;
    }

    emitChange(name, value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Form belum valid");
      setSuccess("");
      return;
    }

    setLoading(true);

    const mode = String(formState.mode || "").toUpperCase();
    const payload = {
      ppdb_period_id: formState.ppdb_period_id,
      ppdb_wave_track_id: formState.is_global_scope ? null : formState.ppdb_wave_track_id,
      ppdb_test_component_id: formState.ppdb_test_component_id,

      title: safeText(formState.title),
      mode,
      online_url:
        mode === "ONLINE" || mode === "HYBRID"
          ? safeText(formState.online_url)
          : safeText(formState.online_url) || null,

      start_at: safeText(formState.start_at),
      end_at: safeText(formState.end_at),

      checkin_open_at: safeText(formState.checkin_open_at) || null,
      late_after_at: safeText(formState.late_after_at) || null,
      checkin_close_at: safeText(formState.checkin_close_at) || null,

      capacity: toIntOrNull(formState.capacity),
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
        <Grid container spacing={2} rowSpacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Periode PMB</CustomFormLabel>
            <CustomSelect
              name="ppdb_period_id"
              value={formState.ppdb_period_id}
              onChange={(e) => {
                const nextPeriodId = e.target.value;
                emitChange("ppdb_period_id", nextPeriodId);
                emitChange("ppdb_wave_track_id", "");
                emitChange("ppdb_test_component_id", "");
              }}
              fullWidth
              required
              displayEmpty
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
                  {p.nama}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Scope Sesi Jadwal Tes</CustomFormLabel>
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
                    checked={Boolean(formState.is_global_scope)}
                    onChange={(e) => emitChange("is_global_scope", e.target.checked)}
                    icon={<IconSwitch />}
                  />
                }
                label={
                  formState?.is_global_scope
                    ? "GLOBAL (Semua Gelombang & Jalur)"
                    : "SPESIFIK (Gelombang dan Jalur)"
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Jalur per Gelombang (Opsional)</CustomFormLabel>
            <CustomSelect
              name="ppdb_wave_track_id"
              value={formState.ppdb_wave_track_id}
              onChange={handleChange}
              fullWidth
              displayEmpty
              disabled={!formState.ppdb_period_id || formState.is_global_scope}
              startAdornment={
                <InputAdornment position="start">
                  <IconMapPin />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                {formState.is_global_scope ? "Scope GLOBAL aktif" : "Pilih Jalur (Jalur per gelombang)"}
              </MenuItem>
              {waveTrackOptions.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Komponen Tes</CustomFormLabel>
            <CustomSelect
              name="ppdb_test_component_id"
              value={formState.ppdb_test_component_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={!formState.ppdb_period_id}
              startAdornment={
                <InputAdornment position="start">
                  <IconCategory2 />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Pilih Komponen Tes
              </MenuItem>
              {componentOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nama}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Judul Sesi Jadwal Tes</CustomFormLabel>
            <CustomOutlinedInput
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="Contoh: Tes Matematika Gelombang 1"
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <IconForms />
                </InputAdornment>
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Kapasitas (Opsional)</CustomFormLabel>
            <CustomOutlinedInput
              name="capacity"
              value={formState.capacity}
              onChange={handleChange}
              placeholder="Contoh: 30"
              fullWidth
              inputMode="numeric"
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>Mode</CustomFormLabel>
            <CustomSelect
              name="mode"
              value={formState.mode}
              onChange={(e) => {
                const nextMode = String(e.target.value || "").toUpperCase();
                emitChange("mode", nextMode);
                if (nextMode === "OFFLINE") emitChange("online_url", "");
              }}
              fullWidth
              required
              displayEmpty
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
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Link Online {["ONLINE", "HYBRID"].includes(String(formState.mode).toUpperCase()) ? "(Wajib)" : "(Opsional)"}
            </CustomFormLabel>
            <CustomOutlinedInput
              name="online_url"
              value={formState.online_url}
              onChange={handleChange}
              placeholder="Contoh: https://meet.google.com/xxx-xxxx-xxx"
              fullWidth
              disabled={String(formState.mode).toUpperCase() === "OFFLINE"}
              startAdornment={
                <InputAdornment position="start">
                  <IconLink />
                </InputAdornment>
              }
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
                  placeholder: "Pilih tanggal",
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
                  placeholder: "Pilih jam",
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
                  placeholder: "Pilih tanggal",
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
                  placeholder: "Pilih jam",
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
                  placeholder: "Pilih tanggal",
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
                  placeholder: "Pilih jam",
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
          <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
            Simpan
          </SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default TambahPpdbSesiJadwalForm;
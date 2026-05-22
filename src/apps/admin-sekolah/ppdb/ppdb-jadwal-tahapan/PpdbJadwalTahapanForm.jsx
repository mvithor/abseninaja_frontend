import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, InputAdornment, MenuItem } from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import {
  IconBox,
  IconFileText,
  IconListNumbers,
  IconCalendarTime,
  IconClock,
  IconSwitch,
  IconMapPin,
  IconNotes,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { Switch, FormControlLabel } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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

const normalizeIsoOrEmpty = (iso) => {
  const s = String(iso || "").trim();
  if (!s) return "";
  const d = dayjs(s);
  return d.isValid() ? d.toISOString() : "";
};

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

const TambahPpdbJadwalTahapanForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefillPeriodId = searchParams.get("ppdb_period_id") || "";
  const prefillEventTypeId = searchParams.get("ppdb_event_type_id") || "";
  const prefillWaveTrackId = searchParams.get("ppdb_wave_track_id") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: prefillPeriodId,
    ppdb_event_type_id: prefillEventTypeId,
    ppdb_wave_track_id: prefillWaveTrackId,
    sequence: "",
    title: "",
    start_at: "",
    end_at: "",
    location: "",
    description: "",
    is_active: true,
  });

  const emitChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // ===================== Dropdown Options =====================
  const { data: periodOptions = [] } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/admin-sekolah/dropdown/ppdb-period");
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows.map((p) => ({
        id: p.id,
        nama: p.nama,
        status: p.status,
        tahun_ajaran: p?.tahun_ajaran || "-",
      }));
    },
    refetchOnWindowFocus: false,
  });

  const { data: eventTypeOptions = [] } = useQuery({
    queryKey: ["ppdbEventTypeDropdown", formState.ppdb_period_id],
    enabled: Boolean(formState.ppdb_period_id),
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("limit", "200");

      const response = await axiosInstance.get(
        `/api/v1/admin-sekolah/dropdown/ppdb-tahapan?${qs.toString()}`
      );

      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows.map((t) => ({
        id: t.id,
        code: t.code,
        nama: t.nama,
      }));
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
      return rows
        .filter((wt) => wt?.is_open !== false)
        .map((wt) => ({
          id: wt.id,
          ppdb_wave_id: wt.ppdb_wave_id,
          ppdb_track_id: wt.ppdb_track_id,
          wave_nama: wt?.Wave?.nama || wt?.wave_nama || "-",
          track_nama: wt?.Track?.nama || wt?.track_nama || "-",
          track_kode: wt?.Track?.kode || wt?.track_kode || "",
          is_open: wt.is_open,
        }));
    },
    refetchOnWindowFocus: false,
  });

  const selectedPeriod = useMemo(() => {
    if (!formState.ppdb_period_id) return null;
    return periodOptions.find((p) => String(p.id) === String(formState.ppdb_period_id)) || null;
  }, [formState.ppdb_period_id, periodOptions]);

  const selectedWaveTrack = useMemo(() => {
    if (!formState.ppdb_wave_track_id) return null;
    return waveTrackOptions.find((x) => String(x.id) === String(formState.ppdb_wave_track_id)) || null;
  }, [formState.ppdb_wave_track_id, waveTrackOptions]);

  // ===================== Date/Time Split =====================
  const startDT = toDayjs(formState.start_at);
  const endDT = toDayjs(formState.end_at);

  const startDate = startDT ? startDT.startOf("day") : null;
  const startTime = startDT ? startDT : null;

  const endDate = endDT ? endDT.startOf("day") : null;
  const endTime = endDT ? endDT : null;

  // ===================== Derived flags =====================
  const isPeriodArchived = useMemo(() => {
    return String(selectedPeriod?.status || "").toUpperCase() === "ARCHIVED";
  }, [selectedPeriod]);

  // ===================== Validation UI =====================
  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!formState.ppdb_event_type_id) return false;
    if (!formState.start_at) return false;

    if (isPeriodArchived) return false;

    if (formState.start_at && formState.end_at) {
      const s = new Date(formState.start_at).getTime();
      const e = new Date(formState.end_at).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e < s) return false;
    }

    const seq = toIntOrNull(formState.sequence);
    if (String(formState.sequence || "").trim().length > 0) {
      if (seq === null) return false;
      if (seq < 1) return false;
    }

    return true;
  }, [formState, isPeriodArchived]);

  // ===================== Mutation =====================
  const mutation = useMutation({
    mutationKey: ["tambahJadwalTahapan"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb/jadwal-tahapan", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      setSuccess(data?.msg || "Jadwal tahapan PMB berhasil dibuat");
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["ppdb-jadwal-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["ppdb-jadwal-tahapan"] });

      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/ppdb-jadwal-tahapan");
      }, 300);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg =
        error.response?.data?.msg || "Terjadi kesalahan saat menambahkan Jadwal Tahapan";
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(errorMsg);
      }
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // ===================== Handlers =====================
  function AttachAndSanitizeNumber(val) {
    return String(val ?? "").replace(/[^\d]/g, "");
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "sequence") {
      const cleaned = AttachAndSanitizeNumber(value);
      setFormState((prev) => ({ ...prev, sequence: cleaned }));
      return;
    }

    if (name === "ppdb_period_id") {
      setFormState((prev) => ({
        ...prev,
        ppdb_period_id: value,
        ppdb_event_type_id: "",
        ppdb_wave_track_id: "",
      }));
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.ppdb_period_id) {
      setError("PMB Period wajib dipilih");
      setSuccess("");
      return;
    }

    if (isPeriodArchived) {
      setError("PMB Period sudah ARCHIVED. Tidak bisa menambah jadwal");
      setSuccess("");
      return;
    }

    if (!formState.ppdb_event_type_id) {
      setError("Tahapan wajib dipilih");
      setSuccess("");
      return;
    }

    if (!formState.start_at) {
      setError("Tanggal/jam mulai wajib diisi");
      setSuccess("");
      return;
    }

    if (formState.start_at && formState.end_at) {
      const s = new Date(formState.start_at).getTime();
      const e = new Date(formState.end_at).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e < s) {
        setError("Tanggal/jam selesai tidak boleh lebih awal dari mulai");
        setSuccess("");
        return;
      }
    }

    const seq = toIntOrNull(formState.sequence);
    if (String(formState.sequence || "").trim().length > 0) {
      if (seq === null) {
        setError("Urutan (sequence) harus berupa angka");
        setSuccess("");
        return;
      }
      if (seq < 1) {
        setError("Urutan (sequence) minimal 1");
        setSuccess("");
        return;
      }
    }

    setLoading(true);

    const hasWT = Boolean(String(formState.ppdb_wave_track_id || "").trim());

    const payload = {
      ppdb_period_id: formState.ppdb_period_id,
      ppdb_event_type_id: formState.ppdb_event_type_id,
      ppdb_wave_track_id: hasWT ? formState.ppdb_wave_track_id : null,
      title: String(formState.title || "").trim().length > 0 ? String(formState.title).trim() : null,
      start_at: normalizeIsoOrEmpty(formState.start_at),
      end_at:
        String(formState.end_at || "").trim().length > 0
          ? normalizeIsoOrEmpty(formState.end_at)
          : null,

      location:
        String(formState.location || "").trim().length > 0
          ? String(formState.location).trim()
          : null,
      description:
        String(formState.description || "").trim().length > 0
          ? String(formState.description).trim()
          : null,

      is_active: Boolean(formState.is_active),
    };

    if (seq !== null) {
      payload.sequence = seq;
    }

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
            <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 1.85 }}>
              PMB Period
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_period_id"
              name="ppdb_period_id"
              value={formState.ppdb_period_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              inputProps={{ "aria-label": "Pilih PPDB Period" }}
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

            {isPeriodArchived ? (
              <TypographyNote text="Period ini ARCHIVED. Anda tidak bisa menambah jadwal pada period ini." />
            ) : null}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_event_type_id" sx={{ mt: 1.85 }}>
              Tahapan PMB
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_event_type_id"
              name="ppdb_event_type_id"
              value={formState.ppdb_event_type_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={!formState.ppdb_period_id || isPeriodArchived}
              inputProps={{ "aria-label": "Pilih Event Type" }}
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
              Gelombang dan Jalur
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_wave_track_id"
              name="ppdb_wave_track_id"
              value={formState.ppdb_wave_track_id}
              onChange={handleChange}
              fullWidth
              displayEmpty
              disabled={!formState.ppdb_period_id || isPeriodArchived}
              inputProps={{ "aria-label": "Pilih Mapping Gelombang-Jalur" }}
              startAdornment={
                <InputAdornment position="start">
                  <IconBox />
                </InputAdornment>
              }
            >
              <MenuItem value="">Semua Gelombang & Jalur</MenuItem>
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
              <TypographyNote text="Kosongkan jika tahapan berlaku untuk semua gelombang & semua jalur) pada period ini" />
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="sequence" sx={{ mt: 1.85 }}>
              Urutan
            </CustomFormLabel>
            <CustomOutlinedInput
              id="sequence"
              name="sequence"
              value={formState.sequence}
              onChange={handleChange}
              placeholder="Contoh: 1"
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              fullWidth
              inputMode="numeric"
              disabled={isPeriodArchived}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Status Aktif
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
                    checked={Boolean(formState.is_active)}
                    onChange={(e) => emitChange("is_active", e.target.checked)}
                    icon={<IconSwitch />}
                    disabled={isPeriodArchived}
                  />
                }
                label={formState.is_active ? "AKTIF" : "NONAKTIF"}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="title" sx={{ mt: 1.85 }}>
              Judul Tahapan
            </CustomFormLabel>
            <CustomOutlinedInput
              id="title"
              name="title"
              value={formState.title}
              onChange={handleChange}
              placeholder="Contoh: Pendaftaran Gelombang 1"
              startAdornment={
                <InputAdornment position="start">
                  <IconFileText />
                </InputAdornment>
              }
              fullWidth
              disabled={isPeriodArchived}
            />
          </Grid>

          {/* START: DATE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Tanggal Mulai (Wajib)
            </CustomFormLabel>

            <DatePicker
              value={startDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, startTime);
                emitChange("start_at", iso);
              }}
              format="DD MMM YYYY"
              disabled={isPeriodArchived}
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
              Jam Mulai (Wajib)
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
              disabled={isPeriodArchived}
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
              Tanggal Selesai (Opsional)
            </CustomFormLabel>

            <DatePicker
              value={endDate}
              onChange={(val) => {
                const iso = mergeDateTimeToIso(val, endTime);
                emitChange("end_at", iso);
              }}
              format="DD MMM YYYY"
              minDate={startDate || undefined}
              disabled={isPeriodArchived}
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
              Jam Selesai (Opsional)
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
              disabled={isPeriodArchived}
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
              value={formState.location}
              onChange={handleChange}
              placeholder="Contoh: Aula Sekolah / Online"
              startAdornment={
                <InputAdornment position="start">
                  <IconMapPin />
                </InputAdornment>
              }
              fullWidth
              disabled={isPeriodArchived}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <CustomFormLabel htmlFor="description" sx={{ mt: 1.85 }}>
              Deskripsi (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="description"
              name="description"
              value={formState.description}
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
              disabled={isPeriodArchived}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
          <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
            Simpan
          </SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default TambahPpdbJadwalTahapanForm;

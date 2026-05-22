import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBox, IconFileText, IconListNumbers, IconCalendarTime, IconClock, IconSwitch } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

const TambahPpdbWaveTrackForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefillPeriodId = searchParams.get("ppdb_period_id") || "";
  const prefillWaveId = searchParams.get("ppdb_wave_id") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: prefillPeriodId,
    ppdb_wave_id: prefillWaveId,
    ppdb_track_id: '',
    is_open: true,
    quota: '',
    open_at: '',
    close_at: '',
    sort_order: '',
  });

  const emitChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const { data: periodOptions = [] } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/ppdb-period');
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows
        .filter((p) => String(p?.status || '').toUpperCase() !== 'ARCHIVED')
        .map((p) => ({
          id: p.id,
          nama: p.nama,
          status: p.status,
          tahun_ajaran: p?.tahun_ajaran || '-',
        }));
    },
    refetchOnWindowFocus: false
  });

  const { data: waveOptions = [] } = useQuery({
    queryKey: ["ppdbWaveOptions", formState.ppdb_period_id],
    enabled: Boolean(formState.ppdb_period_id),
    queryFn: async () => {
      const q = formState.ppdb_period_id
        ? `?ppdb_period_id=${encodeURIComponent(formState.ppdb_period_id)}`
        : "";
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-wave${q}`);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows
        .filter((w) => String(w?.PpdbPeriod?.status || '').toUpperCase() !== 'ARCHIVED')
        .map((w) => ({
          id: w.id,
          nama: w.nama,
          status: w.status,
          open_at: w.open_at,
          close_at: w.close_at,
          quota_global: w.quota_global,
        }));
    },
    refetchOnWindowFocus: false
  });

  const { data: trackOptions = [] } = useQuery({
    queryKey: ["ppdbTrackOptions", formState.ppdb_period_id],
    enabled: Boolean(formState.ppdb_period_id),
    queryFn: async () => {
      const q = formState.ppdb_period_id
        ? `?ppdb_period_id=${encodeURIComponent(formState.ppdb_period_id)}`
        : "";
      const response = await axiosInstance.get(`/api/v1/admin-sekolah/dropdown/ppdb-track${q}`);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      return rows
        .map((t) => ({
          id: t.id,
          kode: t.kode,
          nama: t.nama,
          is_active: t.is_active,
        }))
        .filter((t) => t.is_active !== false);
    },
    refetchOnWindowFocus: false
  });

  const openDT = toDayjs(formState.open_at);
  const closeDT = toDayjs(formState.close_at);

  const openDate = openDT ? openDT.startOf("day") : null;
  const openTime = openDT ? openDT : null;

  const closeDate = closeDT ? closeDT.startOf("day") : null;
  const closeTime = closeDT ? closeDT : null;

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!formState.ppdb_wave_id) return false;
    if (!formState.ppdb_track_id) return false;

    if (formState.open_at && formState.close_at) {
      const open = new Date(formState.open_at).getTime();
      const close = new Date(formState.close_at).getTime();
      if (!Number.isNaN(open) && !Number.isNaN(close) && close < open) return false;
    }

    const q = toIntOrNull(formState.quota);
    if (String(formState.quota || '').trim().length > 0) {
      if (q === null) return false;
      if (q < 0) return false;
    }

    const so = toIntOrNull(formState.sort_order);
    if (String(formState.sort_order || '').trim().length > 0) {
      if (so === null) return false;
      if (so < 0) return false;
    }

    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahWaveTrack"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/api/v1/admin-sekolah/ppdb-wave-track', payload);
      return response.data;
    },
    onSuccess: async (data) => {
      setSuccess(data?.msg || 'Jalur per Gelombang berhasil dibuat');
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["ppdb-wave-track"] });
  
      setTimeout(() => {
        navigate('/dashboard/admin-sekolah/ppdb-jalur-gelombang');
      }, 300);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan Jalur per Gelombang';
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(', '));
      } else {
        setError(errorMsg);
      }
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    },
    onSettled: () => {
      setLoading(false);
    }
  });
  

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'quota' || name === 'sort_order') {
      const cleaned = AttachAndSanitizeNumber(value);
      setFormState((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === 'ppdb_period_id') {
      setFormState((prev) => ({
        ...prev,
        ppdb_period_id: value,
        ppdb_wave_id: '',
        ppdb_track_id: '',
      }));
      return;
    }

    if (name === 'ppdb_wave_id') {
      setFormState((prev) => ({
        ...prev,
        ppdb_wave_id: value,
        ppdb_track_id: '',
      }));
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  function AttachAndSanitizeNumber(val) {
    return String(val ?? '').replace(/[^\d]/g, '');
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.ppdb_period_id) {
      setError('Periode PPDB wajib dipilih');
      setSuccess('');
      return;
    }

    if (!formState.ppdb_wave_id) {
      setError('Gelombang wajib dipilih');
      setSuccess('');
      return;
    }

    if (!formState.ppdb_track_id) {
      setError('Jalur wajib dipilih');
      setSuccess('');
      return;
    }

    if (formState.open_at && formState.close_at) {
      const open = new Date(formState.open_at).getTime();
      const close = new Date(formState.close_at).getTime();
      if (!Number.isNaN(open) && !Number.isNaN(close) && close < open) {
        setError('Tanggal/jam tutup tidak boleh lebih awal dari tanggal/jam buka');
        setSuccess('');
        return;
      }
    }

    const quota = toIntOrNull(formState.quota);
    if (String(formState.quota || '').trim().length > 0) {
      if (quota === null) {
        setError('Kuota harus berupa angka');
        setSuccess('');
        return;
      }
      if (quota < 0) {
        setError('Kuota tidak boleh negatif');
        setSuccess('');
        return;
      }
    }

    const sortOrder = toIntOrNull(formState.sort_order);
    if (String(formState.sort_order || '').trim().length > 0) {
      if (sortOrder === null) {
        setError('Urutan harus berupa angka');
        setSuccess('');
        return;
      }
      if (sortOrder < 0) {
        setError('Urutan tidak boleh negatif');
        setSuccess('');
        return;
      }
    }

    setLoading(true);

    const payload = {
      ppdb_wave_id: formState.ppdb_wave_id,
      ppdb_track_id: formState.ppdb_track_id,
      is_open: Boolean(formState.is_open),
      quota: String(formState.quota || '').trim().length > 0 ? quota : null,
      open_at: formState.open_at ? String(formState.open_at) : null,
      close_at: formState.close_at ? String(formState.close_at) : null,
      sort_order: String(formState.sort_order || '').trim().length > 0 ? sortOrder : null,
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
            <CustomFormLabel htmlFor="ppdb_period_id" sx={{ mt: 1.85 }}>
              Periode PMB
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_period_id"
              name="ppdb_period_id"
              value={formState.ppdb_period_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
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
                  {p.nama} — {p.tahun_ajaran} ({String(p.status || '').toUpperCase()})
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_wave_id" sx={{ mt: 1.85 }}>
              Gelombang
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_wave_id"
              name="ppdb_wave_id"
              value={formState.ppdb_wave_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={!formState.ppdb_period_id}
              inputProps={{ "aria-label": "Pilih Gelombang" }}
              startAdornment={
                <InputAdornment position="start">
                  <IconBox />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Pilih Gelombang
              </MenuItem>
              {waveOptions.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.nama} ({String(w.status || '').toUpperCase()})
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="ppdb_track_id" sx={{ mt: 1.85 }}>
              Jalur
            </CustomFormLabel>
            <CustomSelect
              id="ppdb_track_id"
              name="ppdb_track_id"
              value={formState.ppdb_track_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              disabled={!formState.ppdb_period_id}
              inputProps={{ "aria-label": "Pilih Jalur" }}
              startAdornment={
                <InputAdornment position="start">
                  <IconFileText />
                </InputAdornment>
              }
            >
              <MenuItem value="" disabled>
                Pilih Jalur
              </MenuItem>
              {trackOptions.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nama} {t.kode ? `— ${String(t.kode)}` : ''}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel sx={{ mt: 1.85 }}>
              Status Buka
            </CustomFormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '46px', px: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formState.is_open)}
                    onChange={(e) => emitChange('is_open', e.target.checked)}
                    icon={<IconSwitch />}
                  />
                }
                label={formState.is_open ? 'OPEN' : 'CLOSED'}
              />
            </Box>
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

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="quota" sx={{ mt: 1.85 }}>
              Kuota Jalur (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="quota"
              name="quota"
              value={formState.quota}
              onChange={handleChange}
              placeholder="Contoh: 30"
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              fullWidth
              inputMode="numeric"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>
              Urutan
            </CustomFormLabel>
            <CustomOutlinedInput
              id="sort_order"
              name="sort_order"
              value={formState.sort_order}
              onChange={handleChange}
              placeholder="Contoh: 1"
              startAdornment={
                <InputAdornment position="start">
                  <IconListNumbers />
                </InputAdornment>
              }
              fullWidth
              inputMode="numeric"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
          <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
            Simpan
          </SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default TambahPpdbWaveTrackForm;

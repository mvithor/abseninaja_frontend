import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconFileText, IconCalendarTime, IconBox, IconListNumbers, IconClock } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

// MUI X Pickers
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

const TambahPpdbWaveForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: '',
    nama: '',
    open_at: '',
    close_at: '',
    quota_global: '',
  });

  const { data: periodOptions = [], isError: periodError } = useQuery({
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

  const emitChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };


  const openDT = toDayjs(formState.open_at);
  const closeDT = toDayjs(formState.close_at);

  const openDate = openDT ? openDT.startOf("day") : null;
  const openTime = openDT ? openDT : null;

  const closeDate = closeDT ? closeDT.startOf("day") : null;
  const closeTime = closeDT ? closeDT : null;

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!String(formState.nama || '').trim()) return false;
    if (formState.open_at && formState.close_at) {
      const open = new Date(formState.open_at).getTime();
      const close = new Date(formState.close_at).getTime();
      if (!Number.isNaN(open) && !Number.isNaN(close) && close < open) return false;
    }

    const q = toIntOrNull(formState.quota_global);
    if (String(formState.quota_global || '').trim().length > 0) {
      if (q === null) return false;
      if (q < 0) return false;
    }

    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahWave"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/api/v1/admin-sekolah/ppdb-wave', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data?.msg || 'Gelombang PPDB berhasil dibuat');
      setError("");
      setTimeout(() => navigate('/dashboard/admin-sekolah/ppdb-gelombang'), 1200);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan gelombang PPDB';
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
    if (name === 'quota_global') {
      const cleaned = String(value ?? '').replace(/[^\d]/g, '');
      setFormState((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.ppdb_period_id) {
      setError('Periode PMB wajib dipilih');
      setSuccess('');
      return;
    }

    if (!String(formState.nama || '').trim()) {
      setError('Nama gelombang wajib diisi');
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

    const quota = toIntOrNull(formState.quota_global);
    if (String(formState.quota_global || '').trim().length > 0) {
      if (quota === null) {
        setError('Kuota global harus berupa angka');
        setSuccess('');
        return;
      }
      if (quota < 0) {
        setError('Kuota global tidak boleh negatif');
        setSuccess('');
        return;
      }
    }

    setLoading(true);

    const payload = {
      ppdb_period_id: formState.ppdb_period_id,
      nama: String(formState.nama || '').trim(),
      open_at: formState.open_at ? String(formState.open_at) : undefined,
      close_at: formState.close_at ? String(formState.close_at) : undefined,
      quota_global: quota,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === null || payload[k] === undefined || payload[k] === '') delete payload[k];
    });

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (periodError) {
    return <div>Error Loading Data...</div>;
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
              value={formState.ppdb_period_id}
              onChange={handleChange}
              fullWidth
              required
              displayEmpty
              inputProps={{ "aria-label": "Pilih Periode PPDB" }}
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
            <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
              Nama Gelombang
            </CustomFormLabel>
            <CustomOutlinedInput
              id="nama"
              name="nama"
              value={formState.nama}
              onChange={handleChange}
              placeholder="Contoh: Gelombang 1"
              startAdornment={
                <InputAdornment position="start">
                  <IconFileText />
                </InputAdornment>
              }
              fullWidth
              required
            />
          </Grid>
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
            <CustomFormLabel htmlFor="quota_global" sx={{ mt: 1.85 }}>
              Kuota Global (Opsional)
            </CustomFormLabel>
            <CustomOutlinedInput
              id="quota_global"
              name="quota_global"
              value={formState.quota_global}
              onChange={handleChange}
              placeholder="Contoh: 120"
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

export default TambahPpdbWaveForm;

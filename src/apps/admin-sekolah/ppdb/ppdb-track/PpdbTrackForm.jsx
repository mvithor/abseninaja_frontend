import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import {
  IconBox,
  IconFileText,
  IconAbc,
  IconListNumbers,
  IconToggleRight
} from "@tabler/icons-react";
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

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

const normalizeKodeClient = (kode) => {
  return String(kode || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
};

const TambahPpdbTrackForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillPeriodId = searchParams.get("ppdb_period_id") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: prefillPeriodId,
    kode: '',
    nama: '',
    is_active: true,
    sort_order: '',
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

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!String(formState.kode || '').trim()) return false;
    if (!String(formState.nama || '').trim()) return false;

    // sort_order kalau diisi, harus integer >= 0
    const sRaw = String(formState.sort_order || '').trim();
    if (sRaw.length > 0) {
      const so = toIntOrNull(sRaw);
      if (so === null) return false;
      if (so < 0) return false;
    }

    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahTrack"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('/api/v1/admin-sekolah/ppdb-track', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data?.msg || 'Jalur PMB berhasil dibuat');
      setError("");
      const to = formState.ppdb_period_id
        ? `/dashboard/admin-sekolah/ppdb-jalur?ppdb_period_id=${encodeURIComponent(formState.ppdb_period_id)}`
        : '/dashboard/admin-sekolah/ppdb-jalur';

      setTimeout(() => navigate(to), 1200);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan jalur PMB';
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
    const { name, value, checked, type } = event.target;

    if (name === 'is_active') {
      setFormState((prev) => ({ ...prev, is_active: Boolean(checked) }));
      return;
    }

    if (name === 'sort_order') {
      const cleaned = String(value ?? '').replace(/[^\d]/g, '');
      setFormState((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === 'kode') {
      const cleaned = String(value ?? '').replace(/\s+/g, ' ');
      setFormState((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.ppdb_period_id) {
      setError('Periode PMB wajib dipilih');
      setSuccess('');
      return;
    }

    if (!String(formState.kode || '').trim()) {
      setError('Kode jalur wajib diisi');
      setSuccess('');
      return;
    }

    if (!String(formState.nama || '').trim()) {
      setError('Nama jalur wajib diisi');
      setSuccess('');
      return;
    }

    const sRaw = String(formState.sort_order || '').trim();
    const sortOrder = sRaw.length > 0 ? toIntOrNull(sRaw) : null;

    if (sRaw.length > 0) {
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
      ppdb_period_id: formState.ppdb_period_id,
      kode: normalizeKodeClient(formState.kode),
      nama: String(formState.nama || '').trim(),
      is_active: Boolean(formState.is_active),
      sort_order: sortOrder,
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
          <CustomFormLabel htmlFor="kode" sx={{ mt: 1.85 }}>
            Kode Jalur
          </CustomFormLabel>
          <CustomOutlinedInput
            id="kode"
            name="kode"
            value={formState.kode}
            onChange={handleChange}
            placeholder="Contoh: ZONASI / PRESTASI / AFIRMASI"
            startAdornment={
              <InputAdornment position="start">
                <IconAbc />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
            Nama Jalur
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nama"
            name="nama"
            value={formState.nama}
            onChange={handleChange}
            placeholder="Contoh: Reguler"
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>
            Urutan Tampilan
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

        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>
            Status Jalur Pendaftaran
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
                {formState.is_active ? "Aktif" : "Nonaktif"}
              </Typography>
            </Box>

            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  name="is_active"
                  checked={Boolean(formState.is_active)}
                  onChange={handleChange}
                />
              }
              label=""
            />
          </Box>
        </Grid>

      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default TambahPpdbTrackForm;
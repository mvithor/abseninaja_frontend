import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
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
import { IconBox, IconListNumbers, IconSwitch } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const toFloatOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const AttachAndSanitizeNumber = (val) => {
  return String(val ?? "").replace(/[^\d.]/g, "");
};

const TambahPpdbWaveTrackTestRequirementForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefillPeriodId = searchParams.get("ppdb_period_id") || "";
  const prefillWaveTrackId = searchParams.get("ppdb_wave_track_id") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: prefillPeriodId,
    ppdb_wave_track_id: prefillWaveTrackId,
    ppdb_test_component_id: "",
    is_required: true,
    min_score: "",
    weight: "",
    is_elimination: false,
    sort_order: "",
  });

  const emitChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const { data: periodOptions = [] } = useQuery({
    queryKey: ["ppdbPeriodOptions"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/api/v1/admin-sekolah/dropdown/ppdb-period"
      );
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
      const response = await axiosInstance.get(
        `/api/v1/admin-sekolah/dropdown/ppdb-wave-track${q}`
      );
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];

      return rows.map((r) => {
        const wave = r?.wave_nama || "-";
        const track = r?.track_nama || "-";
        const kode = r?.track_kode ? ` (${String(r.track_kode)})` : "";
        const open =
          r?.is_open === true ? "OPEN" : r?.is_open === false ? "CLOSED" : "-";
        const waveStatus = r?.wave_status
          ? String(r.wave_status).toUpperCase()
          : "-";

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
      const response = await axiosInstance.get(
        `/api/v1/admin-sekolah/dropdown/ppdb-komponen-tes${q}`
      );
      return response.data?.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;
    if (!formState.ppdb_wave_track_id) return false;
    if (!formState.ppdb_test_component_id) return false;

    const minScore = toFloatOrNull(formState.min_score);
    const weight = toFloatOrNull(formState.weight);
    const sortOrder = toFloatOrNull(formState.sort_order);

    if (String(formState.min_score || "").trim().length > 0 && minScore === null)
      return false;
    if (String(formState.weight || "").trim().length > 0 && weight === null)
      return false;
    if (
      String(formState.sort_order || "").trim().length > 0 &&
      sortOrder === null
    )
      return false;

    if (formState.is_elimination && minScore === null) return false;

    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahWaveTrackTestRequirement"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        "/api/v1/admin-sekolah/ppdb-wave-track-requirement",
        payload
      );
      return response.data;
    },
    onSuccess: async (data) => {
      setSuccess(data?.msg || "Persyaratan Tes berhasil ditambahkan");
      setError("");
      await queryClient.invalidateQueries({
        queryKey: ["ppdb-wave-track-test-requirements"],
      });
      setTimeout(() => {
        navigate(-1);
      }, 300);
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
    onSettled: () => {
      setLoading(false);
    },
  });


  const handleChange = (event) => {
    const { name, value } = event.target;

    if (["min_score", "weight", "sort_order"].includes(name)) {
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

    const payload = {
      ppdb_period_id: formState.ppdb_period_id,
      ppdb_wave_track_id: formState.ppdb_wave_track_id,
      ppdb_test_component_id: formState.ppdb_test_component_id,
      is_required: Boolean(formState.is_required),
      is_elimination: Boolean(formState.is_elimination),
      min_score: toFloatOrNull(formState.min_score),
      weight: toFloatOrNull(formState.weight),
      sort_order: toFloatOrNull(formState.sort_order),
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Periode PMB</CustomFormLabel>
          <CustomSelect
            name="ppdb_period_id"
            value={formState.ppdb_period_id}
            onChange={handleChange}
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
          <CustomFormLabel sx={{ mt: 1.85 }}>Jalur per Gelombang</CustomFormLabel>
          <CustomSelect
            name="ppdb_wave_track_id"
            value={formState.ppdb_wave_track_id}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={!formState.ppdb_period_id}
          >
            <MenuItem value="" disabled>
              Pilih Jalur dan Gelombang
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
          <CustomFormLabel sx={{ mt: 1.85 }}>Nilai Minimum (Opsional)</CustomFormLabel>
          <CustomOutlinedInput
            name="min_score"
            value={formState.min_score}
            onChange={handleChange}
            placeholder="Contoh: 70"
            fullWidth
            inputMode="decimal"
            startAdornment={
              <InputAdornment position="start">
                <IconListNumbers />
              </InputAdornment>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Bobot (Opsional)</CustomFormLabel>
          <CustomOutlinedInput
            name="weight"
            value={formState.weight}
            onChange={handleChange}
            placeholder="Contoh: 30"
            fullWidth
            inputMode="decimal"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Urutan</CustomFormLabel>
          <CustomOutlinedInput
            name="sort_order"
            value={formState.sort_order}
            onChange={handleChange}
            placeholder="Contoh: 1"
            fullWidth
            inputMode="numeric"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Wajib Diikuti</CustomFormLabel>
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
                  checked={Boolean(formState.is_required)}
                  onChange={(e) => emitChange("is_required", e.target.checked)}
                  icon={<IconSwitch />}
                />
              }
              label={formState?.is_required ? "WAJIB" : "OPSIONAL"}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Gugur (Opsional)</CustomFormLabel>
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
                  checked={Boolean(formState.is_elimination)}
                  onChange={(e) => emitChange("is_elimination", e.target.checked)}
                  icon={<IconSwitch />}
                />
              }
              label={formState?.is_elimination ? "GUGUR" : "TIDAK"}
            />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default TambahPpdbWaveTrackTestRequirementForm;
import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem,
  Switch,
  FormControlLabel
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import {
  IconBox,
  IconCode,
  IconFileText,
  IconClock,
  IconScoreboard,
  IconSettings,
  IconSwitch
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const toNumberOrNull = (val) => {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
};

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const TEST_TYPE_OPTIONS = [
  { id: "MANUAL", label: "MANUAL" },
  { id: "INTERVIEW", label: "INTERVIEW" },
  { id: "PRACTICE", label: "PRACTICE" },
  { id: "CBT", label: "CBT" }
];

const TambahPpdbTestComponentForm = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefillPeriodId = searchParams.get("ppdb_period_id") || "";

  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    ppdb_period_id: prefillPeriodId,
    code: "",
    nama: "",
    type: "MANUAL",
    description: "",
    duration_minutes: "",
    score_min: "0",
    score_max: "100",
    is_active: true
  });

  const emitChange = (name, value) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const { data: periodOptions = [] } = useQuery({
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
          tahun_ajaran: p?.tahun_ajaran || "-"
        }));
    },
    refetchOnWindowFocus: false
  });

  const canSubmit = useMemo(() => {
    if (!formState.ppdb_period_id) return false;

    const code = String(formState.code || "").trim();
    const nama = String(formState.nama || "").trim();
    if (code.length < 2) return false;
    if (nama.length < 3) return false;

    const type = safeUpper(formState.type);
    if (!["MANUAL", "INTERVIEW", "PRACTICE", "CBT"].includes(type)) return false;

    if (String(formState.duration_minutes || "").trim().length > 0) {
      const dm = toIntOrNull(formState.duration_minutes);
      if (dm === null) return false;
      if (dm < 1 || dm > 1440) return false;
    }

    const sMinFilled = String(formState.score_min || "").trim().length > 0;
    const sMaxFilled = String(formState.score_max || "").trim().length > 0;

    const sMin = sMinFilled ? toNumberOrNull(formState.score_min) : 0;
    const sMax = sMaxFilled ? toNumberOrNull(formState.score_max) : 100;

    if (sMin === null || sMax === null) return false;
    if (sMin < 0 || sMax < 0) return false;
    if (sMin > sMax) return false;

    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahTestComponent"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb-test-component", payload);
      return response.data;
    },
    onSuccess: async (data) => {
      setSuccess(data?.msg || "Komponen tes berhasil ditambahkan");
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["ppdb-test-components"] });

      setTimeout(() => {
        navigate("/dashboard/admin-sekolah/ppdb-test-component");
      }, 3000);
    },
    onError: (error) => {
      const errorDetails = error.response?.data?.errors || [];
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan komponen tes";
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
    }
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "ppdb_period_id") {
      setFormState((prev) => ({
        ...prev,
        ppdb_period_id: value
      }));
      return;
    }

    if (name === "type") {
      emitChange("type", safeUpper(value));
      return;
    }

    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  function AttachAndSanitizeNumber(val) {
    return String(val ?? "").replace(/[^\d.]/g, "");
  }

  function AttachAndSanitizeInt(val) {
    return String(val ?? "").replace(/[^\d]/g, "");
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formState.ppdb_period_id) {
      setError("Periode PMB wajib dipilih");
      setSuccess("");
      return;
    }

    const code = String(formState.code || "").trim();
    if (code.length < 2) {
      setError("Kode minimal 2 karakter");
      setSuccess("");
      return;
    }

    const nama = String(formState.nama || "").trim();
    if (nama.length < 3) {
      setError("Nama komponen tes minimal 3 karakter");
      setSuccess("");
      return;
    }

    const type = safeUpper(formState.type) || "MANUAL";
    if (!["MANUAL", "INTERVIEW", "PRACTICE", "CBT"].includes(type)) {
      setError("Tipe komponen tes tidak valid");
      setSuccess("");
      return;
    }

    const durationFilled = String(formState.duration_minutes || "").trim().length > 0;
    const duration = durationFilled ? toIntOrNull(formState.duration_minutes) : null;
    if (durationFilled) {
      if (duration === null) {
        setError("Durasi harus berupa angka");
        setSuccess("");
        return;
      }
      if (duration < 1 || duration > 1440) {
        setError("Durasi minimal 1 menit dan maksimal 1440 menit");
        setSuccess("");
        return;
      }
    }

    const sMinFilled = String(formState.score_min || "").trim().length > 0;
    const sMaxFilled = String(formState.score_max || "").trim().length > 0;

    const score_min = sMinFilled ? toNumberOrNull(formState.score_min) : null;
    const score_max = sMaxFilled ? toNumberOrNull(formState.score_max) : null;

    const nextMin = score_min ?? 0;
    const nextMax = score_max ?? 100;

    if (score_min !== null && score_min < 0) {
      setError("Score minimum minimal 0");
      setSuccess("");
      return;
    }
    if (score_max !== null && score_max < 0) {
      setError("Score maksimum minimal 0");
      setSuccess("");
      return;
    }
    if (Number.isFinite(nextMin) && Number.isFinite(nextMax) && nextMin > nextMax) {
      setError("score_min tidak boleh lebih besar dari score_max");
      setSuccess("");
      return;
    }

    const desc = String(formState.description ?? "").trim();

    setLoading(true);

    const payload = {
      ppdb_period_id: formState.ppdb_period_id,
      code,
      nama,
      type,
      description: desc.length > 0 ? desc : null,
      duration_minutes: duration,
      score_min: score_min ?? undefined,
      score_max: score_max ?? undefined,
      is_active: Boolean(formState.is_active)
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
                {p.nama} — {p.tahun_ajaran} ({String(p.status || "").toUpperCase()})
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="type" sx={{ mt: 1.85 }}>
            Tipe Komponen
          </CustomFormLabel>
          <CustomSelect
            id="type"
            name="type"
            value={formState.type}
            onChange={handleChange}
            fullWidth
            displayEmpty
            inputProps={{ "aria-label": "Pilih tipe komponen" }}
            startAdornment={
              <InputAdornment position="start">
                <IconSettings />
              </InputAdornment>
            }
          >
            {TEST_TYPE_OPTIONS.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 1.85 }}>
            Kode Komponen
          </CustomFormLabel>
          <CustomOutlinedInput
            id="code"
            name="code"
            value={formState.code}
            onChange={(e) => emitChange("code", e.target.value)}
            placeholder="Contoh: TES_WAWANCARA"
            startAdornment={
              <InputAdornment position="start">
                <IconCode />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
            Nama Komponen Tes
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nama"
            name="nama"
            value={formState.nama}
            onChange={(e) => emitChange("nama", e.target.value)}
            placeholder="Contoh: Wawancara Calon Peserta Didik"
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
          <CustomFormLabel htmlFor="duration_minutes" sx={{ mt: 1.85 }}>
            Durasi (menit) (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="duration_minutes"
            name="duration_minutes"
            value={formState.duration_minutes}
            onChange={(e) => emitChange("duration_minutes", AttachAndSanitizeInt(e.target.value))}
            placeholder="Contoh: 30"
            startAdornment={
              <InputAdornment position="start">
                <IconClock />
              </InputAdornment>
            }
            fullWidth
            inputMode="numeric"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel htmlFor="score_min" sx={{ mt: 1.85 }}>
            Score Min (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="score_min"
            name="score_min"
            value={formState.score_min}
            onChange={(e) => emitChange("score_min", AttachAndSanitizeNumber(e.target.value))}
            placeholder="0"
            startAdornment={
              <InputAdornment position="start">
                <IconScoreboard />
              </InputAdornment>
            }
            fullWidth
            inputMode="decimal"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel htmlFor="score_max" sx={{ mt: 1.85 }}>
            Score Max (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="score_max"
            name="score_max"
            value={formState.score_max}
            onChange={(e) => emitChange("score_max", AttachAndSanitizeNumber(e.target.value))}
            placeholder="100"
            startAdornment={
              <InputAdornment position="start">
                <IconScoreboard />
              </InputAdornment>
            }
            fullWidth
            inputMode="decimal"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="description" sx={{ mt: 1.85 }}>
            Deskripsi (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="description"
            name="description"
            value={formState.description}
            onChange={handleChange}
            placeholder="Catatan singkat tentang komponen tes"
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
            multiline
            minRows={3}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>
            Status Aktif
          </CustomFormLabel>
          <Box sx={{ display: "flex", alignItems: "center", height: "46px", px: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formState.is_active)}
                  onChange={(e) => emitChange("is_active", e.target.checked)}
                  icon={<IconSwitch />}
                />
              }
              label={formState.is_active ? "AKTIF" : "NONAKTIF"}
            />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default TambahPpdbTestComponentForm;
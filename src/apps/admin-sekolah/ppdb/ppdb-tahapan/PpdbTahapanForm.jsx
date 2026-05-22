import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem,
  Typography
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconCode, IconFileText, IconSortAscending, IconToggleRight } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const CODE_REGEX = /^[A-Z0-9_]+$/;

const normalizeCode = (v) => String(v || "").trim().toUpperCase();

const parseSortOrder = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return NaN;
  return n;
};

const validateLocal = ({ code, nama, sort_order }) => {
  const errors = {};

  const c = normalizeCode(code);
  if (!c) errors.code = "Code wajib diisi";
  else if (c.length > 50) errors.code = "Maksimal 50 karakter";
  else if (!CODE_REGEX.test(c)) errors.code = "Hanya A-Z, 0-9, underscore (_)";

  const n = String(nama || "").trim();
  if (!n) errors.nama = "Nama wajib diisi";
  else if (n.length > 120) errors.nama = "Maksimal 120 karakter";

  if (sort_order !== null) {
    if (Number.isNaN(sort_order)) errors.sort_order = "Urutan harus angka";
    else if (!Number.isInteger(sort_order)) errors.sort_order = "Urutan harus bilangan bulat";
    else if (sort_order < 0) errors.sort_order = "Minimal 0";
    else if (sort_order > 999999) errors.sort_order = "Maksimal 999999";
  }

  return { ok: Object.keys(errors).length === 0, errors };
};

const TambahPpdbTahapan = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    code: "",
    nama: "",
    deskripsi: "",
    is_active: "true", 
    sort_order: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    code: "",
    nama: "",
    sort_order: "",
  });

  const clearGlobalAlert = () => {
    setError("");
    setSuccess("");
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const setFieldError = (name, message) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const resetAllFieldErrors = () => {
    setFieldErrors({ code: "", nama: "", sort_order: "" });
  };

  const canSubmit = useMemo(() => {
    const payloadCandidate = {
      code: normalizeCode(formState.code),
      nama: String(formState.nama || "").trim(),
      sort_order: parseSortOrder(formState.sort_order),
    };

    const v = validateLocal(payloadCandidate);
    if (!v.ok) return false;

    if (!["true", "false"].includes(String(formState.is_active))) return false;

    // deskripsi opsional, max 5000
    const d = String(formState.deskripsi || "").trim();
    if (d && d.length > 5000) return false;

    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahEventType"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb/event-types", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data?.msg || "Event type berhasil dibuat");
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-tahapan"), 1200);
    },
    onError: (error) => {
      const errorDetails = error?.response?.data?.errors || [];
      const errorMsg = error?.response?.data?.msg || "Terjadi kesalahan saat menambahkan event type";

      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        setError(errorDetails.join(", "));
      } else {
        setError(String(errorMsg));
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

    clearGlobalAlert();
    clearFieldError(name);

    // UX: code auto uppercase di input
    if (name === "code") {
      setFormState((prev) => ({ ...prev, [name]: normalizeCode(value) }));
      return;
    }

    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    resetAllFieldErrors();
    clearGlobalAlert();

    const candidate = {
      code: normalizeCode(formState.code),
      nama: String(formState.nama || "").trim(),
      deskripsi: String(formState.deskripsi || "").trim(),
      is_active: String(formState.is_active) === "true",
      sort_order: parseSortOrder(formState.sort_order),
    };

    const v = validateLocal({
      code: candidate.code,
      nama: candidate.nama,
      sort_order: candidate.sort_order,
    });

    if (!v.ok) {
      Object.entries(v.errors).forEach(([k, msg]) => setFieldError(k, msg));
      setError("Mohon lengkapi data yang wajib diisi");
      setSuccess("");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!["true", "false"].includes(String(formState.is_active))) {
      setError("Status aktif tidak valid");
      setSuccess("");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (candidate.deskripsi && candidate.deskripsi.length > 5000) {
      setError("Deskripsi maksimal 5000 karakter");
      setSuccess("");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);

    const payload = {
      code: candidate.code,
      nama: candidate.nama,
      is_active: candidate.is_active,
      sort_order: candidate.sort_order,
      deskripsi: candidate.deskripsi ? candidate.deskripsi : null,
    };

    // jangan kirim null/empty yg gak perlu (sesuai style kamu)
    Object.keys(payload).forEach((k) => {
      if (payload[k] === null || payload[k] === undefined || payload[k] === "") delete payload[k];
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
          <CustomFormLabel htmlFor="code" sx={{ mt: 1.85 }}>
            Kode Tahapan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="code"
            name="code"
            value={formState.code}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconCode />
              </InputAdornment>
            }
            fullWidth
            placeholder= "Contoh : TES_TERTULIS "
            required
            inputProps={{ maxLength: 50 }}
            error={Boolean(fieldErrors.code)}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.code ? "error.main" : "text.secondary",
            }}
          >
            {fieldErrors.code || "Hanya A-Z, 0-9, underscore (_). Disarankan karena dipakai integrasi"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
            Nama Tahapan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nama"
            name="nama"
            value={formState.nama}
            onChange={handleChange}
            placeholder="Masukkan Nama Tahapan"
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
            required
            inputProps={{ maxLength: 120 }}
            error={Boolean(fieldErrors.nama)}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.nama ? "error.main" : "transparent",
            }}
          >
            {fieldErrors.nama || " "}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>
            Deskripsi (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="deskripsi"
            name="deskripsi"
            value={formState.deskripsi}
            onChange={handleChange}
            placeholder="Opsional. Maks 5000 karakter."
            fullWidth
            multiline
            minRows={3}
          />
          <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>
            {Math.min(String(formState.deskripsi || "").length, 5000)}/5000
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>
            Urutan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="sort_order"
            name="sort_order"
            type="number"
            value={formState.sort_order}
            onChange={handleChange}
            placeholder="Contoh: 1"
            startAdornment={
              <InputAdornment position="start">
                <IconSortAscending />
              </InputAdornment>
            }
            fullWidth
            inputProps={{ min: 0, max: 999999, step: 1 }}
            error={Boolean(fieldErrors.sort_order)}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.sort_order ? "error.main" : "text.secondary",
            }}
          >
            {fieldErrors.sort_order || "Kosongkan jika tidak ingin mengatur urutan"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_active" sx={{ mt: 1.85 }}>
            Status Aktif
          </CustomFormLabel>
          <CustomSelect
            id="is_active"
            name="is_active"
            value={String(formState.is_active)}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            inputProps={{ "aria-label": "Pilih Status Aktif" }}
            startAdornment={
              <InputAdornment position="start">
                <IconToggleRight />
              </InputAdornment>
            }
          >
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Nonaktif</MenuItem>
          </CustomSelect>
          <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>
            Nonaktifkan jika tidak ingin dipakai, tapi tetap simpan histori.
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={loading || mutation.isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel} disabled={loading || mutation.isLoading}>
          Batal
        </CancelButton>
      </Box>
    </Box>
  );
};

export default TambahPpdbTahapan;

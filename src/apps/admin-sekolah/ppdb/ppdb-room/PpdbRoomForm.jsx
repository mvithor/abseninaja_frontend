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
import { IconCode, IconFileText, IconMapPin, IconUsers, IconToggleRight } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const CODE_REGEX = /^[A-Z0-9_]+$/;
const normalizeCode = (v) => String(v || "").trim().toUpperCase();

const safeText = (val) => {
  const s = String(val ?? "").trim();
  return s.length > 0 ? s : null;
};

const parseCapacity = (v) => {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(v);
  if (Number.isNaN(n)) return NaN;
  return n;
};

const validateLocal = ({ code, nama, lokasi, capacity, is_active }) => {
  const errors = {};

  const c = normalizeCode(code);
  if (!c) errors.code = "Kode ruangan wajib diisi";
  else if (c.length < 2) errors.code = "Kode ruangan Minimal 2 karakter";
  else if (c.length > 50) errors.code = "Kode ruangan Maksimal 50 karakter";
  else if (!CODE_REGEX.test(c)) errors.code = "Kode ruangan Hanya A-Z, 0-9, underscore (_)";

  const n = String(nama || "").trim();
  if (!n) errors.nama = "Nama ruangan wajib diisi";
  else if (n.length < 3) errors.nama = "Nama ruangan Minimal 3 karakter";
  else if (n.length > 255) errors.nama = "Nama ruangan Maksimal 255 karakter";

  const l = safeText(lokasi);
  if (l && l.length > 255) errors.lokasi = "Lokasi maksimal 255 karakter";

  const cap = Number(capacity);
  if (!Number.isFinite(cap)) errors.capacity = "Kapasitas ruangan wajib diisi";
  else if (!Number.isInteger(cap)) errors.capacity = "Kapasitas ruangan harus bilangan bulat";
  else if (cap < 1) errors.capacity = "Kapasitas ruangan minimal 1";

  if (!["true", "false"].includes(String(is_active))) {
    errors.is_active = "Status aktif tidak valid";
  }

  return { ok: Object.keys(errors).length === 0, errors };
};

const TambahPpdbRoom = ({ setSuccess, setError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    code: "",
    nama: "",
    lokasi: "",
    capacity: "",
    is_active: "true",
  });

  const [fieldErrors, setFieldErrors] = useState({
    code: "",
    nama: "",
    lokasi: "",
    capacity: "",
    is_active: "",
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
    setFieldErrors({ code: "", nama: "", lokasi: "", capacity: "", is_active: "" });
  };

  const canSubmit = useMemo(() => {
    const candidate = {
      code: normalizeCode(formState.code),
      nama: String(formState.nama || "").trim(),
      lokasi: safeText(formState.lokasi),
      capacity: parseCapacity(formState.capacity),
      is_active: String(formState.is_active),
    };

    const v = validateLocal(candidate);
    if (!v.ok) return false;

    return true;
  }, [formState]);

  const mutation = useMutation({
    mutationKey: ["tambahPpdbTestRoom"],
    mutationFn: async (payload) => {
      const response = await axiosInstance.post("/api/v1/admin-sekolah/ppdb-room", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data?.msg || "Ruang tes berhasil ditambahkan");
      setError("");
      setTimeout(() => navigate("/dashboard/admin-sekolah/ppdb-room"), 1200);
    },
    onError: (error) => {
      const errorDetails = error?.response?.data?.errors || [];
      const errorMsg = error?.response?.data?.msg || "Terjadi kesalahan saat menambahkan ruang tes";
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
      lokasi: safeText(formState.lokasi),
      capacity: parseCapacity(formState.capacity),
      is_active: String(formState.is_active) === "true",
    };

    const v = validateLocal({
      code: candidate.code,
      nama: candidate.nama,
      lokasi: candidate.lokasi,
      capacity: candidate.capacity,
      is_active: String(formState.is_active),
    });

    if (!v.ok) {
      Object.entries(v.errors).forEach(([k, msg]) => setFieldError(k, msg));
      setError("Mohon lengkapi data yang wajib diisi");
      setSuccess("");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);

    const payload = {
      code: candidate.code,
      nama: candidate.nama,
      lokasi: candidate.lokasi,
      capacity: candidate.capacity,
      is_active: candidate.is_active,
    };

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
            Kode Ruangan
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
            {fieldErrors.code || "Hanya boleh huruf, angka, dan garis bawah (_). Sebaiknya tidak sering diubah"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
            Nama Ruangan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nama"
            name="nama"
            value={formState.nama}
            onChange={handleChange}
            placeholder="Contoh: Ruang 1 / Lab Komputer"
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
            required
            inputProps={{ maxLength: 255 }}
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

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="lokasi" sx={{ mt: 1.85 }}>
            Lokasi (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="lokasi"
            name="lokasi"
            value={formState.lokasi}
            onChange={handleChange}
            placeholder="Contoh: Gedung A Lantai 2"
            startAdornment={
              <InputAdornment position="start">
                <IconMapPin />
              </InputAdornment>
            }
            fullWidth
            inputProps={{ maxLength: 255 }}
            error={Boolean(fieldErrors.lokasi)}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.lokasi ? "error.main" : "text.secondary",
            }}
          >
            {fieldErrors.lokasi || "Kosongkan jika tidak ingin menyimpan lokasi."}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="capacity" sx={{ mt: 1.85 }}>
            Kapasitas Ruangan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="capacity"
            name="capacity"
            type="number"
            value={formState.capacity}
            onChange={handleChange}
            placeholder="Contoh: 30"
            startAdornment={
              <InputAdornment position="start">
                <IconUsers />
              </InputAdornment>
            }
            fullWidth
            required
            inputProps={{ min: 1, step: 1 }}
            error={Boolean(fieldErrors.capacity)}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.capacity ? "error.main" : "text.secondary",
            }}
          >
            {fieldErrors.capacity || "Jumlah kursi maksimal untuk ruangan ini"}
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
            error={Boolean(fieldErrors.is_active)}
          >
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Nonaktif</MenuItem>
          </CustomSelect>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.is_active ? "error.main" : "text.secondary",
            }}
          >
            {fieldErrors.is_active || "Nonaktifkan jika tidak ingin dipakai, tapi tetap simpan histori."}
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

export default TambahPpdbRoom;
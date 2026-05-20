import Grid from "@mui/material/Grid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tooltip,
  IconButton,
  Typography,
  InputAdornment,
  MenuItem
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import { IconInfoCircle, IconCode, IconFileText, IconMapPin, IconUsers, IconToggleRight } from "@tabler/icons-react";

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

const PpdbRoomEditForm = ({
  roomData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
  setError,
  setSuccess,
  usageMeta 
}) => {
  const navigate = useNavigate();

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
    setFieldErrors({
      code: "",
      nama: "",
      lokasi: "",
      capacity: "",
      is_active: "",
    });
  };

  const canSubmit = useMemo(() => {
    if (!roomData?.id) return false;

    const code = normalizeCode(roomData?.code);
    const nama = String(roomData?.nama || "").trim();
    const lokasi = safeText(roomData?.lokasi);
    const isActiveStr = String(roomData?.is_active);

    if (!code) return false;
    if (code.length < 2) return false;
    if (code.length > 50) return false;
    if (!CODE_REGEX.test(code)) return false;

    if (!nama) return false;
    if (nama.length < 3) return false;
    if (nama.length > 255) return false;

    if (lokasi && lokasi.length > 255) return false;

    if (!["true", "false"].includes(isActiveStr)) return false;

    const cap = parseCapacity(roomData?.capacity);
    if (!Number.isFinite(cap)) return false;
    if (!Number.isInteger(cap)) return false;
    if (cap < 1) return false;
    if (usageMeta?.usageFloor && Number.isFinite(Number(usageMeta.usageFloor))) {
      if (cap < Number(usageMeta.usageFloor)) return false;
    }

    return true;
  }, [roomData, usageMeta]);

  const onLocalChange = (event) => {
    const { name, value } = event.target;

    clearGlobalAlert();
    clearFieldError(name);

    if (name === "code") {
      const fixed = normalizeCode(value);
      handleChange({ target: { name, value: fixed } });
      return;
    }

    handleChange(event);
  };

  const validateGuard = () => {
    let ok = true;

    const code = normalizeCode(roomData?.code);
    if (!code) {
      ok = false;
      setFieldError("code", "Kode ruangan wajib diisi");
    } else if (code.length < 2) {
      ok = false;
      setFieldError("code", "Kode ruangan Minimal 2 karakter");
    } else if (code.length > 50) {
      ok = false;
      setFieldError("code", "Kode ruangan Maksimal 50 karakter");
    } else if (!CODE_REGEX.test(code)) {
      ok = false;
      setFieldError("code", " Kode ruangan Hanya A-Z, 0-9, underscore (_)");
    }

    const nama = String(roomData?.nama || "").trim();
    if (!nama) {
      ok = false;
      setFieldError("nama", "Nama ruangan wajib diisi");
    } else if (nama.length < 3) {
      ok = false;
      setFieldError("nama", "Nama ruangan Minimal 3 karakter");
    } else if (nama.length > 255) {
      ok = false;
      setFieldError("nama", "Nama ruangan Maksimal 255 karakter");
    }

    const lokasi = safeText(roomData?.lokasi);
    if (lokasi && lokasi.length > 255) {
      ok = false;
      setFieldError("lokasi", "Lokasi maksimal 255 karakter");
    }

    if (!["true", "false"].includes(String(roomData?.is_active))) {
      ok = false;
      setFieldError("is_active", "Status aktif tidak valid");
    }

    const cap = parseCapacity(roomData?.capacity);
    if (!Number.isFinite(cap)) {
      ok = false;
      setFieldError("capacity", "Kapasitas ruangan wajib diisi");
    } else if (!Number.isInteger(cap)) {
      ok = false;
      setFieldError("capacity", "Kapasitas ruangan harus bilangan bulat");
    } else if (cap < 1) {
      ok = false;
      setFieldError("capacity", "Kapasitas ruangan minimal 1");
    }

    if (usageMeta?.usageFloor && Number.isFinite(Number(usageMeta.usageFloor))) {
      const floor = Number(usageMeta.usageFloor);
      if (Number.isFinite(cap) && cap < floor) {
        ok = false;
        setFieldError("capacity", `Kapasitas ruangan minimal ${floor} (sudah dipakai/override)`);
      }
    }

    if (!ok) {
      setSuccess("");
      setError("Mohon lengkapi data yang wajib diisi");
    }

    return ok;
  };

  const onLocalSubmit = (event) => {
    event.preventDefault();

    resetAllFieldErrors();
    clearGlobalAlert();

    if (!validateGuard()) return;

    handleSubmit(event);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const usageNote =
    usageMeta?.usageFloor && Number.isFinite(Number(usageMeta.usageFloor))
      ? `Minimal Kapasitas ruangan saat ini: ${usageMeta.usageFloor} (override max: ${usageMeta?.maxOverride ?? 0}, peserta max: ${usageMeta?.maxParticipantCount ?? 0}).`
      : "Kapasitas tidak dapat diturunkan karena ruangan sudah digunakan pada sesi–ruang";

  return (
    <Box component="form" onSubmit={onLocalSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 1.85 }}>
            Kode Ruangan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="code"
            name="code"
            value={String(roomData?.code ?? "")}
            onChange={onLocalChange}
            startAdornment={
              <InputAdornment position="start">
                <IconCode />
              </InputAdornment>
            }
            fullWidth
            required
            disabled={isLoading}
            error={Boolean(fieldErrors.code)}
            inputProps={{ maxLength: 50 }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.code ? "error.main" : "text.secondary"
            }}
          >
            {fieldErrors.code || "Kode ruangan hanya boleh berisi huruf (A–Z), angka (0–9), dan garis bawah (_), serta wajib unik dalam satu sekolah"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_active" sx={{ mt: 1.85 }}>
            Status Aktif
          </CustomFormLabel>

          <CustomSelect
            id="is_active"
            name="is_active"
            value={String(roomData?.is_active ?? "true")}
            onChange={onLocalChange}
            fullWidth
            required
            displayEmpty
            disabled={isLoading}
            error={Boolean(fieldErrors.is_active)}
            startAdornment={
              <InputAdornment position="start">
                <IconToggleRight />
              </InputAdornment>
            }
            slotProps={{
              input: {
                "aria-label": "Pilih Status Aktif",
              }
            }}
          >
            <MenuItem value="true">Aktif</MenuItem>
            <MenuItem value="false">Nonaktif</MenuItem>
          </CustomSelect>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.is_active ? "error.main" : "transparent"
            }}
          >
            {fieldErrors.is_active || " "}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
            Nama Ruangan
          </CustomFormLabel>
          <CustomTextField
            id="nama"
            name="nama"
            value={String(roomData?.nama ?? "")}
            onChange={onLocalChange}
            fullWidth
            required
            disabled={isLoading}
            error={Boolean(fieldErrors.nama)}
            inputProps={{ maxLength: 255 }}
            placeholder="Contoh: Ruang 1 / Lab Komputer"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconFileText size={18} />
                  </InputAdornment>
                )
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.nama ? "error.main" : "transparent"
            }}
          >
            {fieldErrors.nama || " "}
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
            value={roomData?.capacity === null || roomData?.capacity === undefined ? "" : String(roomData.capacity)}
            onChange={onLocalChange}
            startAdornment={
              <InputAdornment position="start">
                <IconUsers />
              </InputAdornment>
            }
            fullWidth
            required
            disabled={isLoading}
            error={Boolean(fieldErrors.capacity)}
            inputProps={{ min: 1, step: 1 }}
            placeholder="Contoh: 30"
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.capacity ? "error.main" : "text.secondary"
            }}
          >
            {fieldErrors.capacity || "Jumlah kursi maksimal untuk ruangan ini"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <CustomFormLabel htmlFor="lokasi" sx={{ mt: 1.85 }}>
            Lokasi (Opsional)
          </CustomFormLabel>
          <CustomTextField
            id="lokasi"
            name="lokasi"
            value={String(roomData?.lokasi ?? "")}
            onChange={onLocalChange}
            fullWidth
            disabled={isLoading}
            error={Boolean(fieldErrors.lokasi)}
            inputProps={{ maxLength: 255 }}
            placeholder="Contoh: Gedung A Lantai 2"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconMapPin size={18} />
                  </InputAdornment>
                )
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.lokasi ? "error.main" : "text.secondary"
            }}
          >
            {fieldErrors.lokasi || "Kosongkan jika tidak ingin menyimpan lokasi"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Tooltip
              title={
                "Perubahan tidak dapat disimpan.Kode ruangan sudah digunakan atau kapasitas lebih kecil dari jumlah peserta yang sudah terdaftar."
              }
              placement="top"
            >
              <IconButton size="small">
                <IconInfoCircle size={18} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Catatan: {usageNote}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton isLoading={isLoading} disabled={!canSubmit}>
          Simpan
        </SubmitButton>
        <CancelButton onClick={handleCancel || handleBack} disabled={isLoading}>
          Batal
        </CancelButton>
      </Box>
    </Box>
  );
};

export default PpdbRoomEditForm;
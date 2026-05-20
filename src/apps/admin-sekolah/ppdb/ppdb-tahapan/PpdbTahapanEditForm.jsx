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
import { IconInfoCircle, IconCode, IconClock, IconSortAscending } from "@tabler/icons-react";

const normalizeCode = (v) => String(v || "").trim().toUpperCase();

const PpdbTahapanEditForm = ({
  eventTypeData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
  setError,
  setSuccess
}) => {
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({
    code: "",
    nama: "",
    sort_order: "",
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
      sort_order: "",
      is_active: "",
    });
  };

  const canSubmit = useMemo(() => {
    if (!eventTypeData?.id) return false;

    const code = normalizeCode(eventTypeData?.code);
    const nama = String(eventTypeData?.nama || "").trim();
    const isActiveStr = String(eventTypeData?.is_active);

    if (!code) return false;
    if (!nama) return false;
    if (!["true", "false"].includes(isActiveStr)) return false;

    const so = eventTypeData?.sort_order;
    if (so !== null && so !== undefined && String(so) !== "") {
      const n = Number(so);
      if (Number.isNaN(n)) return false;
      if (n < 0) return false;
      if (n > 999999) return false;
    }

    return true;
  }, [eventTypeData]);

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

    const code = normalizeCode(eventTypeData?.code);
    if (!code) {
      ok = false;
      setFieldError("code", "Code wajib diisi");
    } else if (code.length > 50) {
      ok = false;
      setFieldError("code", "Maksimal 50 karakter");
    } else if (!/^[A-Z0-9_]+$/.test(code)) {
      ok = false;
      setFieldError("code", "Hanya A-Z, 0-9, underscore (_)");
    }

    const nama = String(eventTypeData?.nama || "").trim();
    if (!nama) {
      ok = false;
      setFieldError("nama", "Nama wajib diisi");
    } else if (nama.length > 120) {
      ok = false;
      setFieldError("nama", "Maksimal 120 karakter");
    }

    if (!["true", "false"].includes(String(eventTypeData?.is_active))) {
      ok = false;
      setFieldError("is_active", "Status aktif tidak valid");
    }

    const so = eventTypeData?.sort_order;
    if (so !== null && so !== undefined && String(so) !== "") {
      const n = Number(so);
      if (Number.isNaN(n)) {
        ok = false;
        setFieldError("sort_order", "Urutan harus angka");
      } else if (n < 0) {
        ok = false;
        setFieldError("sort_order", "Minimal 0");
      } else if (n > 999999) {
        ok = false;
        setFieldError("sort_order", "Maksimal 999999");
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

  return (
    <Box component="form" onSubmit={onLocalSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 1.85 }}>
            Kode Tahapan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="code"
            name="code"
            value={String(eventTypeData?.code ?? "")}
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
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_active" sx={{ mt: 1.85 }}>
            Status Aktif
          </CustomFormLabel>

          <CustomSelect
            id="is_active"
            name="is_active"
            value={String(eventTypeData?.is_active ?? "true")}
            onChange={onLocalChange}
            fullWidth
            required
            displayEmpty
            disabled={isLoading}
            error={Boolean(fieldErrors.is_active)}
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
            Nama Tahapan
          </CustomFormLabel>
          <CustomTextField
            id="nama"
            name="nama"
            value={String(eventTypeData?.nama ?? "")}
            onChange={onLocalChange}
            fullWidth
            required
            disabled={isLoading}
            error={Boolean(fieldErrors.nama)}
            inputProps={{ maxLength: 120 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>
            Urutan 
          </CustomFormLabel>
          <CustomOutlinedInput
            id="sort_order"
            name="sort_order"
            type="number"
            value={eventTypeData?.sort_order === null || eventTypeData?.sort_order === undefined ? "" : String(eventTypeData.sort_order)}
            onChange={onLocalChange}
            startAdornment={
              <InputAdornment position="start">
                <IconSortAscending />
              </InputAdornment>
            }
            fullWidth
            disabled={isLoading}
            error={Boolean(fieldErrors.sort_order)}
            inputProps={{ min: 0, max: 999999 }}
            placeholder="Opsional"
          />
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.75,
              color: fieldErrors.sort_order ? "error.main" : "text.secondary"
            }}
          >
            {fieldErrors.sort_order || "Opsional. Dipakai untuk urutan default pada jadwal."}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>
            Deskripsi
          </CustomFormLabel>
          <CustomTextField
            id="deskripsi"
            name="deskripsi"
            value={String(eventTypeData?.deskripsi ?? "")}
            onChange={onLocalChange}
            fullWidth
            disabled={isLoading}
            multiline
            minRows={3}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Tooltip
              title="Aturan sistem: Kode hanya boleh berubah bila belum dipakai pada jadwal. Jika sudah dipakai, update Kode ditolak. Nama/deskripsi/sort_order/is_active tetap bisa diubah."
              placement="top"
            >
              <IconButton size="small">
                <IconInfoCircle size={18} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Catatan: kalau update ditolak karena code dipakai jadwal, ubah saja nama/deskripsi/urutan, atau biarkan kode tetap.
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

export default PpdbTahapanEditForm;

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
import { IconInfoCircle, IconChecklist, IconUsers, IconClock } from '@tabler/icons-react';

const formatDateTime = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
};

const PpdbPanitiaEditForm = ({
  panitiaData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
  setError,
  setSuccess
}) => {
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({
    is_active: '',
  });

  const clearGlobalAlert = () => {
    setError("");
    setSuccess("");
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const setFieldError = (name, message) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const resetAllFieldErrors = () => {
    setFieldErrors({
      is_active: '',
    });
  };

  const periodStatus = String(panitiaData?.PpdbPeriod?.status || "").toUpperCase();
  const isArchived = periodStatus === "ARCHIVED";

  const canSubmit = useMemo(() => {
    if (isArchived) return false;
    if (!['true', 'false'].includes(String(panitiaData?.is_active))) return false;
    return true;
  }, [panitiaData, isArchived]);

  const onLocalChange = (event) => {
    const { name } = event.target;

    clearGlobalAlert();
    clearFieldError(name);

    handleChange(event);
  };

  const validateGuard = () => {
    let ok = true;

    if (!['true', 'false'].includes(String(panitiaData?.is_active))) {
      ok = false;
      setFieldError('is_active', 'Status aktif tidak valid');
    }

    if (!ok) {
      setSuccess('');
      setError('Mohon lengkapi data yang wajib diisi');
    }

    return ok;
  };

  const onLocalSubmit = (event) => {
    event.preventDefault();

    resetAllFieldErrors();
    clearGlobalAlert();

    if (!validateGuard()) return;

    if (isArchived) {
      setError("PMB Period sudah ARCHIVED. Data petugas tidak bisa diubah");
      setTimeout(() => setError(""), 3000);
      return;
    }

    handleSubmit(event);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const periodLabel = panitiaData?.PpdbPeriod?.nama
    ? `${panitiaData.PpdbPeriod.nama} (${panitiaData.PpdbPeriod.status || '-'})`
    : "-";

  const userLabel = panitiaData?.AkunPanitia?.name
    ? `${panitiaData.AkunPanitia.name} (${panitiaData.AkunPanitia.email || '-'})`
    : "-";

  return (
    <Box component="form" onSubmit={onLocalSubmit} sx={{ mt: -3 }}>
      <Grid container spacing={2} rowSpacing={1}>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>PMB Period</CustomFormLabel>
          <CustomOutlinedInput
            value={periodLabel}
            onChange={() => {}}
            startAdornment={
              <InputAdornment position="start">
                <IconChecklist />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Petugas PMB</CustomFormLabel>
          <CustomOutlinedInput
            value={userLabel}
            onChange={() => {}}
            startAdornment={
              <InputAdornment position="start">
                <IconUsers />
              </InputAdornment>
            }
            fullWidth
            readOnly
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="is_active" sx={{ mt: 1.85 }}>
            Status Aktif
          </CustomFormLabel>

          <CustomSelect
            id="is_active"
            name="is_active"
            value={String(panitiaData?.is_active ?? 'true')}
            onChange={onLocalChange}
            fullWidth
            required
            displayEmpty
            disabled={isArchived || isLoading}
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
              display: 'block',
              mt: 0.75,
              color: fieldErrors.is_active ? 'error.main' : 'transparent'
            }}
          >
            {fieldErrors.is_active || ' '}
          </Typography>

          {isArchived ? (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: 'warning.main' }}>
              Periode ARCHIVED — perubahan dinonaktifkan.
            </Typography>
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Revoked At</CustomFormLabel>
          <CustomOutlinedInput
            value={formatDateTime(panitiaData?.revoked_at)}
            onChange={() => {}}
            startAdornment={
              <InputAdornment position="start">
                <IconClock />
              </InputAdornment>
            }
            fullWidth
            disabled
          />
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Tooltip
              title="Update hanya mengubah status aktif. Jika dinonaktifkan, sistem otomatis mengisi revoked_at. Jika diaktifkan kembali, revoked_at dikosongkan."
              placement="top"
            >
              <IconButton size="small">
                <IconInfoCircle size={18} />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Catatan: perubahan hanya berlaku pada status petugas PMB
            </Typography>
          </Box>
        </Grid>

      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
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

export default PpdbPanitiaEditForm;

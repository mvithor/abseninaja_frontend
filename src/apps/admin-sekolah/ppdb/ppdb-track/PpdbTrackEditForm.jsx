import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  Switch,
  Typography,
  Paper,
  Chip,
  Divider,
  Alert,
  FormControlLabel
} from "@mui/material";
import {
  IconFileText,
  IconListNumbers,
  IconToggleRight,
  IconAbc,
  IconBox
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const getStatusChip = (statusRaw) => {
  const status = String(statusRaw || "").trim().toUpperCase();

  const map = {
    DRAFT: { label: "DRAFT", variant: "outlined" },
    OPEN: { label: "OPEN", variant: "filled" },
    CLOSED: { label: "CLOSED", variant: "outlined" },
    ARCHIVED: { label: "ARCHIVED", variant: "outlined" }
  };

  return map[status] || { label: status || "-", variant: "outlined" };
};

const InfoCard = ({ periodName, periodStatus, periodYear }) => {
  const chip = getStatusChip(periodStatus);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 1,
        px: 2,
        py: 1.25
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <IconBox size={20} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, lineHeight: 1.2 }} noWrap>
              {periodName || "-"}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", opacity: 0.75 }} noWrap>
              {periodYear || "Tahun ajaran -"}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={chip.label}
          variant={chip.variant}
          size="small"
          sx={{ fontWeight: 800 }}
        />
      </Box>
    </Paper>
  );
};

// Toggle seragam (sesuai contoh kamu)
const ToggleField = ({
  label,
  checked,
  onChange,
  disabled
}) => {
  return (
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
          {label}
        </Typography>
      </Box>

      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
        }
        label=""
      />
    </Box>
  );
};

const PpdbTrackEditForm = ({
  trackData,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading
}) => {
  const periodStatus = String(trackData?.PpdbPeriod?.status || "").toUpperCase();

  const isArchived = periodStatus === "ARCHIVED";
  const isOpen = periodStatus === "OPEN";
  const canEditIdentity = !isArchived && !isOpen;
  const canEditFlags = !isArchived;

  const emitChange = (name, value) => {
    handleChange({ target: { name, value } });
  };

  const periodName = trackData?.PpdbPeriod?.nama || "-";
  const periodYear =
    trackData?.PpdbPeriod?.TahunAjaranTarget?.tahun_ajaran ||
    trackData?.PpdbPeriod?.tahun_ajaran ||
    "-";

  // Hindari "!!" biar tidak kena lint redundant
  const activeChecked = Boolean(trackData?.is_active);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" height={40}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Box sx={{ mb: 2 }}>
        <CustomFormLabel sx={{ mb: 1 }}>Periode PMB</CustomFormLabel>

        <InfoCard
          periodName={periodName}
          periodStatus={periodStatus}
          periodYear={periodYear}
        />

        {isOpen && (
          <Alert severity="info" sx={{ mt: 1.5 }}>
            Periode sudah <b>OPEN</b>. <b>Kode</b> dan <b>Nama</b> dikunci, tetapi <b>Status Aktif</b> dan <b>Urutan</b> masih bisa diubah.
          </Alert>
        )}

        {isArchived && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            Periode sudah <b>ARCHIVED</b>. Jalur tidak bisa diubah.
          </Alert>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Kode Jalur</CustomFormLabel>
          <CustomOutlinedInput
            name="kode"
            value={trackData.kode || ""}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconAbc />
              </InputAdornment>
            }
            fullWidth
            required
            disabled={!canEditIdentity}
            placeholder="Contoh: ZONASI / PRESTASI"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Nama Jalur</CustomFormLabel>
          <CustomOutlinedInput
            name="nama"
            value={trackData.nama || ""}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
            required
            disabled={!canEditIdentity}
            placeholder="Contoh: Jalur Zonasi"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Status Jalur Pendaftaran</CustomFormLabel>

          <ToggleField
            label={activeChecked ? "Aktif" : "Nonaktif"}
            checked={activeChecked}
            onChange={(e) => emitChange("is_active", e.target.checked)}
            disabled={!canEditFlags}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Urutan (sort_order)</CustomFormLabel>
          <CustomOutlinedInput
            name="sort_order"
            value={trackData.sort_order ?? ""}
            onChange={(e) => {
              const cleaned = String(e.target.value ?? "").replace(/[^\d]/g, "");
              emitChange("sort_order", cleaned);
            }}
            startAdornment={
              <InputAdornment position="start">
                <IconListNumbers />
              </InputAdornment>
            }
            inputMode="numeric"
            fullWidth
            disabled={!canEditFlags}
            placeholder="Contoh: 1"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <SubmitButton disabled={isArchived}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PpdbTrackEditForm;
import Grid from "@mui/material/Grid";
import {
  Box,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Switch,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  IconBox,
  IconSwitch,
  IconSettings,
  IconCode,
  IconFileText,
  IconClock,
  IconScoreboard,
  IconInfoCircle,
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const TEST_TYPE_OPTIONS = [
  { id: "MANUAL", label: "MANUAL" },
  { id: "INTERVIEW", label: "INTERVIEW" },
  { id: "PRACTICE", label: "PRACTICE" },
  { id: "CBT", label: "CBT" },
];

const PpdbTestComponentEditForm = ({
  formData,
  periodOptions,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  const periodStatus = String(formData?.PpdbPeriod?.status || "").toUpperCase();
  const isArchived = periodStatus === "ARCHIVED";

  const usage = formData?.usage || null;
  const isUsed = Boolean(usage?.used);
  const disablePeriod = isArchived || isUsed;
  const disableCode = isArchived || isUsed;

  const emitChange = (name, value) => {
    handleChange({ target: { name, value } });
  };

  function AttachAndSanitizeNumber(val) {
    return String(val ?? "").replace(/[^\d.]/g, "");
  }

  function AttachAndSanitizeInt(val) {
    return String(val ?? "").replace(/[^\d]/g, "");
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" height={40}>
        <CircularProgress />
      </Box>
    );
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
            value={formData.ppdb_period_id || ""}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={disablePeriod}
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

        {/* Tipe Komponen */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="type" sx={{ mt: 1.85 }}>
            Tipe Komponen Tes
          </CustomFormLabel>
          <CustomSelect
            id="type"
            name="type"
            value={safeUpper(formData.type) || "MANUAL"}
            onChange={(e) => emitChange("type", safeUpper(e.target.value))}
            fullWidth
            displayEmpty
            disabled={isArchived}
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

        {/* Code */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 1.85 }}>
            Kode Komponen Tes
          </CustomFormLabel>
          <CustomOutlinedInput
            id="code"
            name="code"
            value={formData.code ?? ""}
            onChange={handleChange}
            placeholder="Contoh: TES_WAWANCARA"
            startAdornment={
              <InputAdornment position="start">
                <IconCode />
              </InputAdornment>
            }
            fullWidth
            required
            disabled={disableCode}
          />
        </Grid>

        {/* Nama */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama" sx={{ mt: 1.85 }}>
            Nama Komponen Tes
          </CustomFormLabel>
          <CustomOutlinedInput
            id="nama"
            name="nama"
            value={formData.nama ?? ""}
            onChange={handleChange}
            placeholder="Contoh: Wawancara Calon Peserta Didik"
            startAdornment={
              <InputAdornment position="start">
                <IconFileText />
              </InputAdornment>
            }
            fullWidth
            required
            disabled={isArchived}
          />
        </Grid>

        {/* Durasi */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="duration_minutes" sx={{ mt: 1.85 }}>
            Durasi (menit) (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="duration_minutes"
            name="duration_minutes"
            value={formData.duration_minutes ?? ""}
            onChange={(e) => emitChange("duration_minutes", AttachAndSanitizeInt(e.target.value))}
            placeholder="Contoh: 30"
            startAdornment={
              <InputAdornment position="start">
                <IconClock />
              </InputAdornment>
            }
            fullWidth
            inputMode="numeric"
            disabled={isArchived}
          />
        </Grid>

        {/* Score Min */}
        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel htmlFor="score_min" sx={{ mt: 1.85 }}>
            Score Min (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="score_min"
            name="score_min"
            value={formData.score_min ?? ""}
            onChange={(e) => emitChange("score_min", AttachAndSanitizeNumber(e.target.value))}
            placeholder="0"
            startAdornment={
              <InputAdornment position="start">
                <IconScoreboard />
              </InputAdornment>
            }
            fullWidth
            inputMode="decimal"
            disabled={isArchived}
          />
        </Grid>

        {/* Score Max */}
        <Grid size={{ xs: 12, md: 3 }}>
          <CustomFormLabel htmlFor="score_max" sx={{ mt: 1.85 }}>
            Score Max (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="score_max"
            name="score_max"
            value={formData.score_max ?? ""}
            onChange={(e) => emitChange("score_max", AttachAndSanitizeNumber(e.target.value))}
            placeholder="100"
            startAdornment={
              <InputAdornment position="start">
                <IconScoreboard />
              </InputAdornment>
            }
            fullWidth
            inputMode="decimal"
            disabled={isArchived}
          />
        </Grid>

        {/* Deskripsi */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="description" sx={{ mt: 1.85 }}>
            Deskripsi (Opsional)
          </CustomFormLabel>
          <CustomOutlinedInput
            id="description"
            name="description"
            value={formData.description ?? ""}
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
            disabled={isArchived}
          />
        </Grid>

        {/* Status Aktif */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>
            Status Aktif
          </CustomFormLabel>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "46px",
              px: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={Boolean(formData.is_active)}
                  onChange={(e) => emitChange("is_active", e.target.checked)}
                  icon={<IconSwitch />}
                  disabled={isArchived}
                />
              }
              label={formData?.is_active ? "AKTIF" : "NONAKTIF"}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <IconInfoCircle size={18} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Aturan Edit
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {isUsed
                  ? "Komponen ini sudah dipakai. PMB Period & Kode tidak bisa diubah"
                  : "Komponen belum dipakai. Anda bisa mengubah PMB Period dan Kode."}
                {isArchived ? " Period sudah ARCHIVED, update akan ditolak sistem" : ""}
              </Typography>
              {usage?.counts ? (
                <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                  Dipakai di: Requirement {usage.counts.requirement}, Session {usage.counts.session}, Enrollment{" "}
                  {usage.counts.enrollment}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <SubmitButton disabled={isArchived}>Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PpdbTestComponentEditForm;
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
  IconCircuitSwitchOpen,
  IconScoreboard,
  IconSortAscending,
  IconInfoCircle,
  IconWeight,
} from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const safeUpper = (v) => String(v || "").trim().toUpperCase();

const PpdbWaveTrackTestRequirementEditForm = ({
  formData,
  periodOptions,
  waveTrackOptions,
  componentOptions,
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  const periodStatus = safeUpper(formData?.PpdbPeriod?.status || "");
  const isArchived = periodStatus === "ARCHIVED";

  const usage = formData?.usage || null;
  const isUsed = Boolean(usage?.used);

  const disableIdentity = isArchived || isUsed;

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
            disabled={disableIdentity}
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
                {p.nama} — {p.tahun_ajaran} ({safeUpper(p.status)})
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_wave_track_id" sx={{ mt: 1.85 }}>
            Gelombang dan Jalur
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_wave_track_id"
            name="ppdb_wave_track_id"
            value={formData.ppdb_wave_track_id || ""}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={disableIdentity}
            inputProps={{ "aria-label": "Pilih Gelombang dan Jalur" }}
            startAdornment={
              <InputAdornment position="start">
                <IconSettings />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              Pilih Gelombang dan Jalur
            </MenuItem>
            {waveTrackOptions.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.label}
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="ppdb_test_component_id" sx={{ mt: 1.85 }}>
            Komponen Tes
          </CustomFormLabel>
          <CustomSelect
            id="ppdb_test_component_id"
            name="ppdb_test_component_id"
            value={formData.ppdb_test_component_id || ""}
            onChange={handleChange}
            fullWidth
            required
            displayEmpty
            disabled={disableIdentity}
            inputProps={{ "aria-label": "Pilih Komponen Tes" }}
            startAdornment={
              <InputAdornment position="start">
                <IconCircuitSwitchOpen />
              </InputAdornment>
            }
          >
            <MenuItem value="" disabled>
              Pilih Komponen Tes
            </MenuItem>
            {componentOptions.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.code} — {c.nama} ({safeUpper(c.type)})
              </MenuItem>
            ))}
          </CustomSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="sort_order" sx={{ mt: 1.85 }}>
            Urutan
          </CustomFormLabel>
          <CustomOutlinedInput
            id="sort_order"
            name="sort_order"
            value={formData.sort_order ?? ""}
            onChange={(e) => emitChange("sort_order", AttachAndSanitizeInt(e.target.value))}
            placeholder="Contoh: 1"
            startAdornment={
              <InputAdornment position="start">
                <IconSortAscending />
              </InputAdornment>
            }
            fullWidth
            inputMode="numeric"
            disabled={isArchived}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="min_score" sx={{ mt: 1.85 }}>
                Nilai Minimum {formData?.is_elimination ? "(Wajib)" : "(Opsional)"}
              </CustomFormLabel>
              <CustomOutlinedInput
                id="min_score"
                name="min_score"
                value={formData.min_score ?? ""}
                onChange={(e) => emitChange("min_score", AttachAndSanitizeNumber(e.target.value))}
                placeholder="Contoh: 70"
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
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel htmlFor="weight" sx={{ mt: 1.85 }}>
                Bobot (Opsional)
              </CustomFormLabel>
              <CustomOutlinedInput
                id="weight"
                name="weight"
                value={formData.weight ?? ""}
                onChange={(e) => emitChange("weight", AttachAndSanitizeNumber(e.target.value))}
                placeholder="Contoh: 1"
                startAdornment={
                  <InputAdornment position="start">
                    <IconWeight />
                  </InputAdornment>
                }
                fullWidth
                inputMode="decimal"
                disabled={isArchived}
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
                  checked={Boolean(formData.is_required)}
                  onChange={(e) => emitChange("is_required", e.target.checked)}
                  icon={<IconSwitch />}
                  disabled={isArchived}
                />
              }
              label={formData?.is_required ? "WAJIB" : "OPSIONAL"}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel sx={{ mt: 1.85 }}>Gugur (Elimination)</CustomFormLabel>
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
                  checked={Boolean(formData.is_elimination)}
                  onChange={(e) => emitChange("is_elimination", e.target.checked)}
                  icon={<IconSwitch />}
                  disabled={isArchived}
                />
              }
              label={formData?.is_elimination ? "GUGUR" : "TIDAK"}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2} rowSpacing={1}>

          </Grid>
        </Grid>

        {/* INFO policy */}
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
                  ? "Persyaratan tes ini sudah dipakai. Identitas (Period/Gelombang dan Jalur/Komponen) tidak bisa diubah"
                  : "Persyaratan tes belum dipakai. Anda masih bisa mengubah identitas (Period/Gelombang dan Jalur/Komponen)."}
                {isArchived ? " Period sudah ARCHIVED, update akan ditolak sistem" : ""}
              </Typography>
              {usage?.counts ? (
                <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                  Dipakai di: Sesi tes {usage.counts.session}, Enrollment {usage.counts.enrollment}
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

export default PpdbWaveTrackTestRequirementEditForm;
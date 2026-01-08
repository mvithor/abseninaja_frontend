import {
    Box,
    InputAdornment,
    CircularProgress,
    MenuItem,
  } from "@mui/material";
  import { IconCalendarEvent } from "@tabler/icons-react";
  import Grid from "@mui/material/Grid";
  import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
  import SubmitButton from "src/components/button-group/SubmitButton";
  import CancelButton from "src/components/button-group/CancelButton";
  import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
  import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
  
  const isLockedOptions = [
    { value: "true", label: "Terkunci" },
    { value: "false", label: "Terbuka" },
  ];
  
  const convertBooleanToString = (val) =>
    val === true || val === "true" ? "true" : "false";
  
  const TahunAjaranEditForm = ({
    tahunData,
    handleChange,
    handleSubmit,
    handleCancel,
    isLoading,
  }) => {
    const isLocked = convertBooleanToString(tahunData.is_locked) === "true";
  
    const handleLocalChange = (event) => {
      const { name, value } = event.target;
  
      if (name === "tahun_ajaran") {
        let clean = value.replace(/[^0-9]/g, "");
        if (clean.length > 8) clean = clean.slice(0, 8);
  
        let formatted = clean;
        if (clean.length > 4) {
          formatted = `${clean.slice(0, 4)}/${clean.slice(4)}`;
        }
  
        handleChange({ target: { name, value: formatted } });
        return;
      }
  
      handleChange(event);
    };
  
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="40px">
          <CircularProgress />
        </Box>
      );
    }
  
    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
        <Grid container spacing={2} rowSpacing={1}>
          {/* Tahun Ajaran */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="tahun_ajaran" sx={{ mt: 1.85 }}>
              Tahun Ajaran
            </CustomFormLabel>
            <CustomOutlinedInput
              id="tahun_ajaran"
              name="tahun_ajaran"
              placeholder="Contoh: 2025/2026"
              value={tahunData.tahun_ajaran}
              onChange={handleLocalChange}
              fullWidth
              required
              inputProps={{ maxLength: 9 }}
              disabled={isLocked} // locked => tidak boleh edit tahun_ajaran
              startAdornment={
                <InputAdornment position="start">
                  <IconCalendarEvent size={20} />
                </InputAdornment>
              }
            />
          </Grid>
  
          {/* Status Penguncian */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="is_locked" sx={{ mt: 1.85 }}>
              Status Penguncian
            </CustomFormLabel>
            <CustomSelect
              id="is_locked"
              name="is_locked"
              value={convertBooleanToString(tahunData.is_locked)}
              onChange={handleLocalChange}
              fullWidth
              required
            >
              {isLockedOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
  
          {/* Tombol */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
              }}
            >
              <SubmitButton type="submit">Simpan</SubmitButton>
              <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  export default TahunAjaranEditForm;
  
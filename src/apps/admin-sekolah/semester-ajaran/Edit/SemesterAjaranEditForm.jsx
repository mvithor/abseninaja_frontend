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
  
  const semesterOptions = [
    { value: "ganjil", label: "Ganjil" },
    { value: "genap", label: "Genap" },
  ];
  
  const isAktifOptions = [
    { value: "true", label: "Aktif" },
    { value: "false", label: "Nonaktif" },
  ];
  
  const isLockedOptions = [
    { value: "true", label: "Terkunci" },
    { value: "false", label: "Terbuka" },
  ];
  
  const convertBooleanToString = (val) => (val === true || val === "true" ? "true" : "false");
  
  const SemesterAjaranEditForm = ({
    semesterData,
    handleChange,
    handleSubmit,
    handleCancel,
    isLoading,
  }) => {
    const isLocked = convertBooleanToString(semesterData.is_locked) === "true";
  
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
          {/* Semester */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="semester" sx={{ mt: 1.85 }}>Semester</CustomFormLabel>
            <CustomSelect
              id="semester"
              name="semester"
              value={semesterData.semester}
              onChange={handleLocalChange}
              fullWidth
              required
              disabled={isLocked}
            >
              <MenuItem value="">Pilih Semester</MenuItem>
              {semesterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
  
          {/* Tahun Ajaran */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="tahun_ajaran" sx={{ mt: 1.85 }}>Tahun Ajaran</CustomFormLabel>
            <CustomOutlinedInput
              id="tahun_ajaran"
              name="tahun_ajaran"
              placeholder="Contoh: 2025/2026"
              value={semesterData.tahun_ajaran}
              onChange={handleLocalChange}
              fullWidth
              required
              inputProps={{ maxLength: 9 }}
              disabled={isLocked}
              startAdornment={
                <InputAdornment position="start">
                  <IconCalendarEvent size={20} />
                </InputAdornment>
              }
            />
          </Grid>
  
          {/* Status Aktif */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="is_aktif" sx={{ mt: 1.85 }}>Status Aktif</CustomFormLabel>
            <CustomSelect
              id="is_aktif"
              name="is_aktif"
              value={convertBooleanToString(semesterData.is_aktif)}
              onChange={handleLocalChange}
              fullWidth
              required
              disabled={isLocked}
            >
              {isAktifOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
  
          {/* Status Penguncian */}
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="is_locked" sx={{ mt: 1.85 }}>Status Penguncian</CustomFormLabel>
            <CustomSelect
              id="is_locked"
              name="is_locked"
              value={convertBooleanToString(semesterData.is_locked)}
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
          <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}>
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Grid>
      </Box>
    );
  };
  
  export default SemesterAjaranEditForm;
  
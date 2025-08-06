import Grid from '@mui/material/Grid';
import {
  Box,
  CircularProgress,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";

const PengaturanJamEditForm = ({
  jamData,
  handleTimeChange,
  handleSubmit,
  handleCancel,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  const getFieldLabel = (field) => {
    return field
      .replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        {["jam_masuk", "jam_terlambat", "jam_alpa", "jam_pulang"].map((field) => (
          <Grid size={{ xs: 12, md: 6 }} key={field}>
            <CustomFormLabel htmlFor={field} sx={{ mt: 1.85 }}>
              {getFieldLabel(field)}
            </CustomFormLabel>
            <TimePicker
                ampm={false}
                disableMaskedInput
                value={jamData[field] ? new Date(`1970-01-01T${jamData[field]}`) : null}
                onChange={(value) => handleTimeChange(field, value)}
                desktopModeMediaQuery="@media (min-width:9999px)" // Paksa gunakan mobile
                enableAccessibleFieldDOMStructure={false}
                slotProps={{
                    textField: {
                    fullWidth: true,
                    size: 'medium',
                    required: true,
                    },
                }}
                />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default PengaturanJamEditForm;

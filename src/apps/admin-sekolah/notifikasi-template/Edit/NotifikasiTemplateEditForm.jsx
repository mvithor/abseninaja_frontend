import { Box, CircularProgress, InputAdornment } from "@mui/material";
import { IconCategory, IconFileDescription } from "@tabler/icons-react";
import Grid from '@mui/material/Grid';
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const NotifikasiTemplateEditForm = ({
  notifikasiData,
  handleChange, 
  handleSubmit,
  handleCancel,
  isLoading
}) => {
  if (isLoading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height="40px">
            <CircularProgress />
        </Box>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="key" sx={{ mt: 1.85 }}>Key Template</CustomFormLabel>
            <CustomOutlinedInput
              id="key"
              name="key"
              value={notifikasiData.key || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                <IconCategory />
                  </InputAdornment>
                }
              fullWidth
              required
              readOnly
            />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="type" sx={{ mt: 1.85 }}>Tipe</CustomFormLabel>
            <CustomOutlinedInput
              id="type"
              name="type"
              value={notifikasiData.type || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                <IconCategory />
                  </InputAdornment>
                }
              fullWidth
              required
              readOnly
            />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="business_category" sx={{ mt: 1.85 }}>Kategori Notifikasi</CustomFormLabel>
            <CustomOutlinedInput
              id="business_category"
              name="business_category"
              value={notifikasiData.business_category || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                <IconCategory />
                  </InputAdornment>
                }
              fullWidth
              required
              readOnly
            />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="title" sx={{ mt: 1.85 }}>Nama Notifikasi</CustomFormLabel>
            <CustomOutlinedInput
              id="title"
              name="title"
              value={notifikasiData.title || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                <IconCategory />
                  </InputAdornment>
                }
              fullWidth
              required
            />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="body_short" sx={{ mt: 1.85 }}>Nama Singkat</CustomFormLabel>
            <CustomOutlinedInput
              id="body_short"
              name="body_short"
              value={notifikasiData.body_short || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                <IconCategory />
                  </InputAdornment>
                }
              fullWidth
              required
            />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="body_long" sx={{ mt: 1.85 }}>Isi Notifikasi</CustomFormLabel>
            <CustomOutlinedInput
              id="body_long"
              name="body_long"
              value={notifikasiData.body_long || ""}
              onChange={handleChange}
              startAdornment={
                <InputAdornment position="start">
                <IconCategory />
                  </InputAdornment>
                }
              fullWidth
              required
            />
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
          <SubmitButton type="submit">Simpan</SubmitButton>
          <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default NotifikasiTemplateEditForm
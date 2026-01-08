import Grid from '@mui/material/Grid';
import {
  Box,
  InputAdornment,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { IconBuilding } from "@tabler/icons-react";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";

const EkskulEditForm = ({
  ekskulData,
  pegawaiOptions = [],
  handleChange,
  handleSubmit,
  handleCancel,
  isLoading,
  isPegawaiLoading,
  onPembinaChange,
  onLogoChange,
}) => {
  if (isLoading || isPegawaiLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="40px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4.5 }}>
      <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="nama_ekskul" sx={{ mt: 1.85 }}>Nama</CustomFormLabel>
          <CustomOutlinedInput
            id="nama_ekskul"
            name="nama_ekskul"
            value={ekskulData.nama_ekskul || ""}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <IconBuilding />
              </InputAdornment>
            }
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>Deskripsi</CustomFormLabel>
          <CustomOutlinedInput
            id="deskripsi"
            name="deskripsi"
            value={ekskulData.deskripsi || ""}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="pembina" sx={{ mt: 1.85 }}>Pembina</CustomFormLabel>
          <Autocomplete
            multiple
            id="pembina"
            options={pegawaiOptions}
            getOptionLabel={(option) => option.nama}
            value={ekskulData.pembinaTerpilih || []}
            onChange={(event, newValue) => {
              onPembinaChange(newValue);
            }}
            renderInput={(params) => (
              <CustomTextField {...params} placeholder="Pilih Pembina Ekskul" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CustomFormLabel htmlFor="logo" sx={{ mt: 1.85 }}>
            Logo
          </CustomFormLabel>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap={1}
            mb={1}
          >
            {(ekskulData.logo_file || ekskulData.logo_url) && (
              <Box
                sx={{
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  p: 1,
                  backgroundColor: '#FAFAFA',
                  maxWidth: 140,
                  maxHeight: 140,
                  overflow: 'hidden'
                }}
              >
                <img
                  src={
                    ekskulData.logo_file
                      ? URL.createObjectURL(ekskulData.logo_file)
                      : ekskulData.logo_url
                  }
                  alt="Preview Logo"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                />
              </Box>
            )}
            <CustomOutlinedInput
              id="logo"
              name="logo"
              type="file"
              inputProps={{ accept: "image/*" }}
              onChange={onLogoChange}
              fullWidth
            />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
        <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
  );
};

export default EkskulEditForm;

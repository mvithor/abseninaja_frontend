import { Box, CircularProgress, InputAdornment } from "@mui/material";
import { IconCategory, IconFileDescription } from "@tabler/icons-react";
import Grid from '@mui/material/Grid';
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const KategoriTemplateEditForm = ({
    kategoriTemplateData,
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
                    <CustomFormLabel htmlFor="nama_kategori" sx={{ mt: 1.85 }}>Nama Kategori Template</CustomFormLabel>
                    <CustomOutlinedInput
                        id="nama_kategori"
                        name="nama_kategori"
                        value={kategoriTemplateData.nama_kategori || ""}
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
                    <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>Deskripsi</CustomFormLabel>
                    <CustomOutlinedInput
                        id="deskripsi"
                        name="deskripsi"
                        value={kategoriTemplateData.deskripsi || ""}
                        onChange={handleChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <IconFileDescription />
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

export default KategoriTemplateEditForm;
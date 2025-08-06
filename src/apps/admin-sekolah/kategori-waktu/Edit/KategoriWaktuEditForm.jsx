import { Box, InputAdornment, CircularProgress } from "@mui/material";
import { IconBuilding } from "@tabler/icons-react";
import Grid from "@mui/material/Grid";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const KategoriWaktuEditForm = ({
    kategoriWaktuData,
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
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2}>
            <Grid size={{ xs: 12}}>
                    <Box display="flex" alignItems="center">
                        <CustomFormLabel htmlFor="nama_kategori" sx={{ mt:1.85 }}>
                            Kategori Pegawai
                        </CustomFormLabel>
                    </Box>
                    <CustomOutlinedInput
                        fullWidth
                        id="nama_kategori"
                        name="nama_kategori"
                        value={kategoriWaktuData?.nama_kategori || ''}  
                        onChange={handleChange}
                        variant="outlined"
                        startAdornment={
                            <InputAdornment position="start">
                                <IconBuilding />
                            </InputAdornment>
                        }
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

export default KategoriWaktuEditForm;
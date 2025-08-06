import Grid from "@mui/material/Grid";
import { 
    Box, 
    InputAdornment, 
    CircularProgress 
} from "@mui/material";
import { IconIdBadge2 } from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const KategoriPegawaiEditDetailForm =({ kategoriData, handleChange, handleSubmit, handleCancel, isLoading }) => {
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
                <Grid size={{ xs: 12 }}>
                    <Box display="flex" alignItems="center">
                        <CustomFormLabel htmlFor="nama_subkategori" sx={{ mt: 1.85 }}>
                            Edit Subkategori
                        </CustomFormLabel>
                    </Box>
                    <CustomOutlinedInput
                    fullWidth
                    id="nama_subkategori"
                    name="nama_subkategori"
                    value={kategoriData?.nama_subkategori || ''}  
                    onChange={handleChange}
                    variant="outlined"
                    startAdornment={
                        <InputAdornment position="start">
                            <IconIdBadge2 />
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

export default KategoriPegawaiEditDetailForm;
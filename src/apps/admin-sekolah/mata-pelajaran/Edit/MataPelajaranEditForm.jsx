import { Box, InputAdornment, CircularProgress } from "@mui/material";
import { IconNumbers, IconBook2 } from "@tabler/icons-react";
import Grid from "@mui/material/Grid";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const MataPelajaranEditForm = ({ mapelData, handleChange, handleSubmit, handleCancel, isLoading }) => {
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="40px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit}sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="kode_mapel" sx={{ mt: 1.85 }}>
                        Kode Mata Pelajaran
                    </CustomFormLabel>
                </Box>
                <CustomOutlinedInput
                    fullWidth
                    id="kode_mapel"
                    name="kode_mapel"
                    value={mapelData?.kode_mapel || ''}  
                    onChange={handleChange}
                    variant="outlined"
                    startAdornment={
                        <InputAdornment position="start">
                            <IconNumbers />
                        </InputAdornment>
                    }
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="nama_mapel" sx={{ mt: 1.85 }}>
                        Mata Pelajaran
                    </CustomFormLabel>
                </Box>
                <CustomOutlinedInput
                    fullWidth
                    id="nama_mapel"
                    name="nama_mapel"
                    value={mapelData?.nama_mapel || ''}  
                    onChange={handleChange}
                    variant="outlined"
                    startAdornment={
                        <InputAdornment position="start">
                            <IconBook2 />
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

export default MataPelajaranEditForm;

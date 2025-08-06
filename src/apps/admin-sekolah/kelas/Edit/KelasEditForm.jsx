import Grid from "@mui/material/Grid";
import { 
    Box, 
    InputAdornment,
    MenuItem, 
    CircularProgress 
} from "@mui/material";
import { IconBuilding } from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const KelasEditForm = ({
    KelasData,
    handleChange,
    handleSubmit,
    handleCancel,
    isLoading
}) => {
    const { data: tingkatOptions = [], isLoading: isTingkatLoading } = useQuery({
        queryKey: ["kelasOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/tingkat');
            return response.data.data;
        }
    });

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
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="nama_kelas" sx={{ mt: 1.85 }}>Nama Kelas</CustomFormLabel>
                    <CustomOutlinedInput
                        id="nama_kelas"
                        name="nama_kelas"
                        value={KelasData.nama_kelas || ""}
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
                    <CustomFormLabel htmlFor="tingkat_id" sx={{ mt: 1.85 }}>Tingkat</CustomFormLabel>
                    <CustomSelect
                        id="tingkat_id"
                        name="tingkat_id"
                        value={tingkatOptions.length > 0 ? KelasData.tingkat_id : ""}
                        onChange={handleChange}
                        fullWidth
                        required
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Tingkat" }}
                    >
                        <MenuItem value="" disabled>
                            {isTingkatLoading ? "Memuat..." : "Pilih Tingkat"}
                        </MenuItem>
                        {tingkatOptions.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.nama_tingkat}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default KelasEditForm;

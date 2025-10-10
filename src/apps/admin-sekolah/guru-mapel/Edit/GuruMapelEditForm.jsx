import Grid from "@mui/material/Grid";
import { Box, CircularProgress, MenuItem } from "@mui/material";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const GuruMapelEditForm = ({
    guruMapelData,
    handleChange, 
    handleSubmit,
    handleCancel,
    isLoading
}) => {
    const { data: pegawaiOptions = [], isLoading: isPegawaiLoading } = useQuery({
        queryKey: ["pegawaiOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/guru');
            return response.data.data;
        }
    });

    const { data: offeringOptions = [], isLoading: isOfferingLoading } = useQuery({
        queryKey: ["offeringOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/mapel');
            return response.data.data;
        }
    });

    if (isLoading || isPegawaiLoading || isOfferingLoading) {
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
                    <CustomFormLabel htmlFor="pegawai_id" sx={{ mt: 1.85 }}>
                        Nama Guru
                    </CustomFormLabel>
                    <CustomSelect
                        id="pegawai_id"
                        name="pegawai_id"
                        value={guruMapelData.pegawai_id || ""}
                        onChange={handleChange}
                        fullWidth
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Pegawai" }}
                        MenuProps={{
                            anchorOrigin: { vertical: "bottom", horizontal: "left" },
                            transformOrigin: { vertical: "top", horizontal: "left" },
                            PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                        }}
                    >
                        <MenuItem value="" disabled>
                            Pilih Pegawai
                        </MenuItem>
                        {isPegawaiLoading ? (
                            <MenuItem value="" disabled>Memuat...</MenuItem>
                        ) : (
                            pegawaiOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.nama}
                                </MenuItem>
                            ))
                        )}
                    </CustomSelect>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="offering_id" sx={{ mt: 1.85 }}>
                        Offering
                    </CustomFormLabel>
                    <CustomSelect
                        id="offering_id"
                        name="offering_id"
                        value={guruMapelData.offering_id || ""}
                        onChange={handleChange}
                        fullWidth
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Offering" }}
                        MenuProps={{
                            anchorOrigin: { vertical: "bottom", horizontal: "left" },
                            transformOrigin: { vertical: "top", horizontal: "left" },
                            PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } },
                        }}
                    >
                        <MenuItem value="" disabled>
                            Pilih Offering
                        </MenuItem>
                        {isOfferingLoading ? (
                            <MenuItem value="" disabled>Memuat...</MenuItem>
                        ) : (
                            offeringOptions.map((opt) => (
                                <MenuItem key={opt.id} value={opt.id}>
                                    {opt.label}
                                </MenuItem>
                            ))
                        )}
                    </CustomSelect>
                </Grid>
            </Grid>

            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default GuruMapelEditForm;

import { Box, CircularProgress, MenuItem } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const WaktuEditForm = ({
    waktuData,
    handleChange,
    handleTimeChange,
    handleSubmit,
    handleCancel,
    isLoading
}) => {

    const { data: kategoriWaktuOptions = [], isLoading: isKategoriWaktuLoading } = useQuery({
        queryKey: ["kategoriWaktuOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/kategori-waktu');
            return response.data.data;
        }
    });

    const { data: hariOptions = [], isLoading: isHariLoading } = useQuery({
        queryKey: ["hariOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/hari');
            return response.data.data;
        }
    });



    if (isLoading || isKategoriWaktuLoading || isHariLoading) {
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
                    <CustomFormLabel htmlFor="jam_mulai" sx={{ mt: 1.85 }}>Jam Mulai</CustomFormLabel>
                    <TimePicker
                        ampm={false}
                        disableMaskedInput
                        value={
                            waktuData.jam_mulai
                            ? new Date(`1970-01-01T${waktuData.jam_mulai.replace('.', ':')}`)
                            : null
                        }
                        onChange={(value) => handleTimeChange("jam_mulai", value)}
                        desktopModeMediaQuery="@media (min-width:9999px)"
                        enableAccessibleFieldDOMStructure={false}
                        slotProps={{
                            textField: {
                            fullWidth: true,
                            size: "medium",
                            required: true,
                            },
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="jam_selesai" sx={{ mt: 1.85 }}>Jam Selesai</CustomFormLabel>
                    <TimePicker
                        ampm={false}
                        disableMaskedInput
                        value={
                            waktuData.jam_selesai
                            ? new Date(`1970-01-01T${waktuData.jam_selesai.replace('.', ':')}`)
                            : null
                        }
                        onChange={(value) => handleTimeChange("jam_selesai", value)}
                        desktopModeMediaQuery="@media (min-width:9999px)"
                        enableAccessibleFieldDOMStructure={false}
                        slotProps={{
                            textField: {
                            fullWidth: true,
                            size: "medium",
                            required: true,
                            },
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="kategori_waktu_id" sx={{ mt: 1.85 }}>Kategori Waktu</CustomFormLabel>
                        <CustomSelect
                            id="kategori_waktu_id"
                            name="kategori_waktu_id"
                            value={waktuData.kategori_waktu_id || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            >
                            <MenuItem value="" disabled>
                                Pilih Kategori Waktu
                            </MenuItem>
                            {kategoriWaktuOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                {option.nama_kategori}
                                </MenuItem>
                            ))}
                        </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="hari_id" sx={{ mt: 1.85 }}>Hari</CustomFormLabel>
                        <CustomSelect
                            id="hari_id"
                            name="hari_id"
                            value={waktuData.hari_id || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            >
                            <MenuItem value="" disabled>
                                Pilih Hari
                            </MenuItem>
                            {hariOptions.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                {option.nama_hari}
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

export default WaktuEditForm;

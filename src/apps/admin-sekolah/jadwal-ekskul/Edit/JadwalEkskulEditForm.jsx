import { Box, CircularProgress, MenuItem } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const JadwalEkskulEditForm = ({
    jadwalEkskulData,
    handleChange,
    handleTimeChange,
    handleSubmit,
    handleCancel,
    isLoading
}) => {

    const { data: hariOptions = [], isLoading: isHariLoading } = useQuery({
        queryKey: ["hariOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/hari');
            return response.data.data;
        }
    });

    const { data: ekskulOptions = [], isLoading: isEkskulLoading } = useQuery({
        queryKey: ["ekskulOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/ekskul');
            return response.data.data;
        }
    });

    if (isLoading || isEkskulLoading || isHariLoading) {
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
                    <CustomFormLabel htmlFor="ekskul_id" sx={{ mt: 1.85 }}>Nama Ekstrakurikuler</CustomFormLabel>
                    <CustomSelect
                        id="ekskul_id"
                        name="ekskul_id"
                        value={jadwalEkskulData.ekskul_id || ""}
                        onChange={handleChange}
                        fullWidth
                        required
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Ekstrakurikuler" }}
                        MenuProps={{
                            anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                            },
                            transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                            },
                            PaperProps: {
                            style: {
                                maxHeight: 300,
                                overflowY: "auto",
                            },
                            },
                        }}
                        >
                        <MenuItem value="" disabled>
                            Pilih Ekstrakurikuler
                        </MenuItem>
                        {ekskulOptions.length === 0 ? (
                            <MenuItem value="" disabled>Memuat...</MenuItem>
                        ) : (
                            ekskulOptions.map((option) => (
                            <MenuItem key={`ekskul-${option.id}`} value={option.id}>
                                {option.nama_ekskul}
                            </MenuItem>
                            ))
                        )}
                    </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="hari_id" sx={{ mt: 1.85 }}>Hari</CustomFormLabel>
                    <CustomSelect
                        id="hari_id"
                        name="hari_id"
                        value={jadwalEkskulData.hari_id || ""}
                        onChange={handleChange}
                        fullWidth
                        required
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Hari" }}
                        MenuProps={{
                            anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                            },
                            transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                            },
                            PaperProps: {
                            style: {
                                maxHeight: 300,
                                overflowY: "auto",
                            },
                            },
                        }}
                        >
                        <MenuItem value="" disabled>
                            Pilih Hari
                        </MenuItem>
                        {hariOptions.length === 0 ? (
                            <MenuItem value="" disabled>Memuat...</MenuItem>
                        ) : (
                            hariOptions.map((option) => (
                            <MenuItem key={`hari-${option.id}`} value={option.id}>
                                {option.nama_hari}
                            </MenuItem>
                            ))
                        )}
                    </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="jam_mulai" sx={{ mt: 1.85 }}>Jam Mulai</CustomFormLabel>
                    <TimePicker
                        ampm={false}
                        disableMaskedInput
                        value={
                            jadwalEkskulData.jam_mulai
                            ? new Date(`1970-01-01T${jadwalEkskulData.jam_mulai.replace('.', ':')}`)
                            : null
                        }
                        onChange={(value) => handleTimeChange("jam_mulai", value)}
                        desktopModeMediaQuery="@media (min-width:9999px)" // Paksa gunakan mobile
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
                            jadwalEkskulData.jam_selesai
                            ? new Date(`1970-01-01T${jadwalEkskulData.jam_selesai.replace('.', ':')}`)
                            : null
                        }
                        onChange={(value) => handleTimeChange("jam_selesai", value)}
                        desktopModeMediaQuery="@media (min-width:9999px)" // Paksa gunakan mobile
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
            </Grid>
            <Grid>
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
            <SubmitButton type="submit">Simpan</SubmitButton>
        <CancelButton onClick={handleCancel}>Batal</CancelButton>
      </Box>
    </Box>
    )
};

export default JadwalEkskulEditForm;
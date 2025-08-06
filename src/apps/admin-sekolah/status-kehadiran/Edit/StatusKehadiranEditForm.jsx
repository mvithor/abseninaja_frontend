import Grid from "@mui/material/Grid";
import { 
    Box, 
    InputAdornment,
    CircularProgress 
} from "@mui/material";
import { IconAccessPoint } from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const StatusKehadiranEditForm = ({
    statusKehadiranData,
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
            <Grid container spacing={2} rowGap={1}>
                {/* Field: Nama Status */}
                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="nama_status" sx={{ mt: 1.85 }}>
                        Status Kehadiran
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        fullWidth
                        id="nama_status"
                        name="nama_status"
                        value={statusKehadiranData?.nama_status || ''}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="Masukkan nama status (misal: Kegiatan Luar Sekolah)"
                        startAdornment={
                            <InputAdornment position="start">
                                <IconAccessPoint />
                            </InputAdornment>
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>
                        Deskripsi (Opsional)
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        fullWidth
                        id="deskripsi"
                        name="deskripsi"
                        multiline
                        rows={2}
                        value={statusKehadiranData?.deskripsi || ''}
                        onChange={handleChange}
                        placeholder="Contoh: Digunakan untuk kegiatan luar ruangan seperti kunjungan industri."
                    />
                </Grid>

                {/* Tombol Aksi */}
                <Grid item xs={12}>
                    <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}>
                        <SubmitButton type="submit">Simpan</SubmitButton>
                        <CancelButton onClick={handleCancel}>Batal</CancelButton>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatusKehadiranEditForm;

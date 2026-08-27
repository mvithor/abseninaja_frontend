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

    // Sama seperti di form Tambah — cek status fitur jurusan sekolah ini,
    // dipakai buat toggle section Jurusan. Tidak untuk validasi (itu tetap
    // final di backend).
    const { data: fiturStatus } = useQuery({
        queryKey: ["jurusanFiturStatus"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/jurusan/fitur-status');
            return response.data;
        },
    });
    const fiturJurusanAktif = fiturStatus?.enabled === true;

    const { data: jurusanOptions = [], isLoading: isJurusanLoading, isError: jurusanError } = useQuery({
        queryKey: ["jurusanOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/jurusan');
            return response.data.data;
        },
        enabled: fiturJurusanAktif,
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
                        value={tingkatOptions.length > 0 ? (KelasData.tingkat_id || "") : ""}
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

                {fiturJurusanAktif && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="jurusan_id" sx={{ mt: 1.85 }}>Jurusan</CustomFormLabel>
                        <CustomSelect
                            id="jurusan_id"
                            name="jurusan_id"
                            value={jurusanOptions.length > 0 ? (KelasData.jurusan_id || "") : ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            displayEmpty
                            inputProps={{ "aria-label": "Pilih Jurusan" }}
                        >
                            <MenuItem value="" disabled>
                                {isJurusanLoading ? "Memuat..." : "Pilih Jurusan"}
                            </MenuItem>
                            {jurusanError && (
                                <MenuItem value="" disabled>
                                    Gagal memuat daftar jurusan
                                </MenuItem>
                            )}
                            {!jurusanError && !isJurusanLoading && jurusanOptions.length === 0 && (
                                <MenuItem value="" disabled>
                                    Belum ada jurusan — tambah jurusan dulu
                                </MenuItem>
                            )}
                            {jurusanOptions.map((jurusan) => (
                                <MenuItem key={jurusan.id} value={jurusan.id}>
                                    {jurusan.nama}
                                </MenuItem>
                            ))}
                        </CustomSelect>
                    </Grid>
                )}
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default KelasEditForm;
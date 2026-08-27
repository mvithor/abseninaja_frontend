import { Box, CircularProgress, MenuItem, InputAdornment, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import { IconBuildingArch, IconUser } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const TambahKepalaJurusanForm = ({
    kepalaJurusanData,
    jurusanNama,
    currentKepalaJurusan,
    handleChange,
    handleSubmit,
    handleCancel,
    onRemove,
    isRemoving,
    isLoading,
}) => {
    const { data: pegawaiOptions = [], isLoading: isPegawaiLoading } = useQuery({
        queryKey: ["pegawaiOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/pegawai');
            return response.data.data;
        },
        enabled: !currentKepalaJurusan,
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="40px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: -4 }}>
            {currentKepalaJurusan ? (
                <Box>
                    <Grid container spacing={2} rowSpacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <CustomFormLabel sx={{ mt: 1.85 }}>Jurusan</CustomFormLabel>
                            <CustomOutlinedInput
                                fullWidth
                                readOnly
                                value={jurusanNama || '-'}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <IconBuildingArch />
                                    </InputAdornment>
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <CustomFormLabel sx={{ mt: 1.85 }}>Kepala Jurusan Saat Ini</CustomFormLabel>
                            <CustomOutlinedInput
                                fullWidth
                                readOnly
                                value={currentKepalaJurusan.nama || '-'}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <IconUser />
                                    </InputAdornment>
                                }
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                        <CustomFormLabel component="p" sx={{ fontWeight: 400 }}>
                            Jurusan ini sudah memiliki Kepala Jurusan pada tahun ajaran aktif. Hapus
                            penugasan ini terlebih dahulu sebelum menetapkan Kepala Jurusan baru.
                        </CustomFormLabel>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }}>
                        {/* [FIX] SubmitButton mengabaikan sx & onClick (terbukti dari
                            warna yang tidak berubah di UI sebelumnya) — pakai
                            <Button> MUI polos supaya onClick benar-benar terpasang. */}
                        <Button
                            type="button"
                            variant="contained"
                            color="error"
                            onClick={onRemove}
                            disabled={isRemoving}
                        >
                            {isRemoving ? 'Menghapus...' : 'Hapus Penugasan'}
                        </Button>
                        <CancelButton onClick={handleCancel}>Kembali</CancelButton>
                    </Box>
                </Box>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2} rowSpacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <CustomFormLabel htmlFor="jurusan_nama" sx={{ mt: 1.85 }}>
                                Jurusan
                            </CustomFormLabel>
                            <CustomOutlinedInput
                                id="jurusan_nama"
                                fullWidth
                                readOnly
                                value={jurusanNama || '-'}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <IconBuildingArch />
                                    </InputAdornment>
                                }
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <CustomFormLabel htmlFor="pegawai_id" sx={{ mt: 1.85 }}>
                                Pegawai
                            </CustomFormLabel>
                            <CustomSelect
                                id="pegawai_id"
                                name="pegawai_id"
                                value={kepalaJurusanData.pegawai_id || ""}
                                onChange={handleChange}
                                fullWidth
                                displayEmpty
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
                                            overflowY: 'auto',
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="" disabled>
                                    {isPegawaiLoading ? 'Memuat...' : 'Pilih Pegawai'}
                                </MenuItem>
                                {!isPegawaiLoading && pegawaiOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.nama}
                                        {option.kategori && option.kategori !== '-' ? ` — ${option.kategori}` : ''}
                                    </MenuItem>
                                ))}
                            </CustomSelect>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
                        <SubmitButton type="submit">Simpan</SubmitButton>
                        <CancelButton onClick={handleCancel}>Batal</CancelButton>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default TambahKepalaJurusanForm;
import Grid from "@mui/material/Grid";
import {
    Box,
    InputAdornment,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import axiosInstance from "src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { IconIdBadge2, IconUser, IconMail } from "@tabler/icons-react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomTextField from "src/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";

const PegawaiGuruEditForm = ({ guruData, handleChange, handleSubmit, handleCancel, isLoading }) => {
    const { data: kategoriOptions = [], isLoading: isKategoriLoading } = useQuery({
        queryKey: ["kategoriOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get("/api/v1/admin-sekolah/kategori-pegawai");
            return response.data.data;
        },
    });

    const { data: subKategoriOptions = [], isLoading: isSubKategoriLoading } = useQuery({
        queryKey: ["subKategoriOptions", guruData.kategori_pegawai_id],
        queryFn: async () => {
            if (!guruData.kategori_pegawai_id) return [];
            const response = await axiosInstance.get(
                `/api/v1/admin-sekolah/kategori-pegawai/${guruData.kategori_pegawai_id}/subkategori`
            );
            
            return response.data.data.sort((a, b) =>
                a.nama_subkategori.localeCompare(b.nama_subkategori)
            );
        },
        enabled: !!guruData.kategori_pegawai_id,
    });

    // Verifikasi nilai `subkategori_pegawai_id`
    const safeSubkategoriValue = subKategoriOptions.some(
        (option) => option.id === guruData.subkategori_pegawai_id
    )
        ? guruData.subkategori_pegawai_id
        : "";

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="40px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit}  sx={{ mt: -6 }} >
            <Box sx={{ borderRadius: 2, mt: 0 }}>
                <Grid container spacing={2} rowSpacing={1} >
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="name" sx={{ mt: 4 }}>Nama Guru</CustomFormLabel>
                        <CustomOutlinedInput
                            id="name"
                            name="name"
                            value={guruData.name || ""}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconUser />
                                </InputAdornment>
                            }
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="email" sx={{ mt: 4 }}>Email</CustomFormLabel>
                        <CustomOutlinedInput
                            id="email"
                            name="email"
                            value={guruData.email || ""}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconMail />
                                </InputAdornment>
                            }
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="password" sx={{ mt: 1.85 }}>Password</CustomFormLabel>
                        <CustomOutlinedInput
                            id="password"
                            name="password"
                            type="password"
                            value={guruData.password || ""}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="nip" sx={{ mt: 1.85 }}>NIP</CustomFormLabel>
                        <CustomOutlinedInput
                            id="nip"
                            name="nip"
                            value={guruData.nip || ""}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconIdBadge2 />
                                </InputAdornment>
                            }
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="kategori_pegawai_id" sx={{ mt: 1.85 }}>Kategori Pegawai</CustomFormLabel>
                        <CustomSelect
                            id="kategori_pegawai_id"
                            name="kategori_pegawai_id"
                            value={guruData.kategori_pegawai_id || ""}
                            onChange={handleChange}
                            fullWidth
                        >
                            {isKategoriLoading ? (
                                <MenuItem value="">Memuat...</MenuItem>
                            ) : (
                                kategoriOptions.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.nama_kategori}
                                    </MenuItem>
                                ))
                            )}
                        </CustomSelect>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="subkategori_pegawai_id" sx={{ mt: 1.85 }}>
                            Subkategori Pegawai
                        </CustomFormLabel>
                        <CustomSelect
                        id="subkategori_pegawai_id"
                        name="subkategori_pegawai_id"
                        value={safeSubkategoriValue}
                        onChange={handleChange}
                        fullWidth
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Subkategori Pegawai" }}
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
                            Pilih Subkategori Pegawai
                        </MenuItem>
                        {isSubKategoriLoading ? (
                            <MenuItem value="" disabled>Memuat...</MenuItem>
                        ) : (
                            subKategoriOptions.map((option) => (
                            <MenuItem key={`subkategori-${option.id}`} value={option.id}>
                                {option.nama_subkategori}
                            </MenuItem>
                            ))
                        )}
                        </CustomSelect>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="tempat_lahir" sx={{ mt: 1.85 }}>Tempat Lahir</CustomFormLabel>
                        <CustomOutlinedInput
                            id="tempat_lahir"
                            name="tempat_lahir"
                            value={guruData.tempat_lahir || ""}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="tanggal_lahir" sx={{ mt: 1.85 }}>Tanggal Lahir</CustomFormLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                value={guruData.tanggal_lahir ? new Date(guruData.tanggal_lahir) : null}
                                onChange={(date) =>
                                handleChange({ target: { name: "tanggal_lahir", value: date } })
                                }
                                format="dd/MM/yyyy"
                                disableFuture
                                enableAccessibleFieldDOMStructure={false}
                                slots={{ textField: CustomTextField }}
                                slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: 'medium',
                                },
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="alamat" sx={{ mt: 1.5 }}>Alamat</CustomFormLabel>
                        <CustomOutlinedInput
                            id="alamat"
                            name="alamat"
                            value={guruData.alamat || ""}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="nomor_telepon" sx={{ mt: 1.85 }}>Nomor Telepon</CustomFormLabel>
                        <CustomOutlinedInput
                            id="nomor_telepon"
                            name="nomor_telepon"
                            value={guruData.nomor_telepon || ""}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 3 }}>
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default PegawaiGuruEditForm;

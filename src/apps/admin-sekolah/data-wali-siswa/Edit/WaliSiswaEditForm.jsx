import Grid from '@mui/material/Grid';
import {
    Box,
    InputAdornment,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import { IconBriefcase, 
         IconUser, 
         IconPhone,
         IconHome
       } from "@tabler/icons-react";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "src/utils/axiosInstance";

const WalisSiswaEditForm = ({
    waliSiswaData,
    handleChange, 
    handleSubmit,
    handleCancel,
    isLoading
}) => {
    const { data: siswaOptions = [], isLoading: isSiswaLoading } = useQuery({
        queryKey: ["siswaOptions"],
        queryFn: async () => {
          const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/siswa');
          return response.data.data;
        }
    });

    if (isLoading || isSiswaLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="40px">
                <CircularProgress />
            </Box>
        )
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -5 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 3 }}>Nama Wali Siswa</CustomFormLabel>
                        <CustomOutlinedInput
                            id="name"
                            name="name"
                            value={waliSiswaData.name || ""}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconUser />
                                </InputAdornment>
                            }
                            fullWidth
                            readOnly
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                <CustomFormLabel htmlFor="siswa_id" sx={{ mt: 3 }}>
                    Nama Siswa
                    </CustomFormLabel>
                    <CustomSelect
                    id="siswa_id"
                    name="siswa_id"
                    value={waliSiswaData.siswa_id || ""}
                    onChange={handleChange}
                    fullWidth
                    required
                    displayEmpty
                    inputProps={{ "aria-label": "Pilih Siswa" }}
                    MenuProps={{
                        anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left"
                        },
                        transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                        },
                        PaperProps: {
                        style: {
                            maxHeight: 300,
                            overflowY: 'auto'
                        }
                        }
                    }}
                    >
                    <MenuItem value="" disabled>
                        Pilih Siswa
                    </MenuItem>

                    {isSiswaLoading ? (
                        <MenuItem disabled value="">
                        Memuat...
                        </MenuItem>
                    ) : (
                        siswaOptions.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.User?.name}
                        </MenuItem>
                        ))
                    )}
                    </CustomSelect>

                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="hubungan" sx={{ mt: 1.85 }}>Hubungan Keluarga</CustomFormLabel>
                        <CustomSelect
                            id="hubungan"
                            name="hubungan"
                            value={waliSiswaData.hubungan || ""}
                            onChange={handleChange}
                            fullWidth
                        >
                            {['Ayah', 'Ibu', 'Kakak', 'Paman', 'Bibi', 'Wali Lainnya'].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="pekerjaan" sx={{ mt: 1.85 }}>Pekerjaan</CustomFormLabel>
                        <CustomOutlinedInput
                            id="pekerjaan"
                            name="pekerjaan"
                            value={waliSiswaData.pekerjaan || ""}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconBriefcase />
                                </InputAdornment>
                            }
                            fullWidth
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="nomor_telepon" sx={{ mt: 1.85 }}>Nomor WhatsApp</CustomFormLabel>
                        <CustomOutlinedInput
                            id="nomor_telepon"
                            name="nomor_telepon"
                            value={waliSiswaData.nomor_telepon || ""}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconPhone />
                                </InputAdornment>
                            }
                            fullWidth
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="alamat" sx={{ mt: 1.85 }}>Alamat</CustomFormLabel>
                        <CustomOutlinedInput
                            id="alamat"
                            name="alamat"
                            value={waliSiswaData.alamat || ""}
                            onChange={handleChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconHome />
                                </InputAdornment>
                            }
                            fullWidth
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="is_wali_utama" sx={{ mt: 1.85 }}>Apakah Wali Utama?</CustomFormLabel>
                        <CustomSelect
                            id="is_wali_utama"
                            name="is_wali_utama"
                            value={waliSiswaData.is_wali_utama || ""}
                            onChange={handleChange}
                            fullWidth
                            
                        >
                            <MenuItem value="">Pilih Status Wali Utama</MenuItem>
                            <MenuItem value="true">Iya</MenuItem>
                            <MenuItem value="false">Tidak</MenuItem>   
                        </CustomSelect>
                </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 2, mt: 4 }}>
                <SubmitButton type="submit">Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    )
};

export default WalisSiswaEditForm;
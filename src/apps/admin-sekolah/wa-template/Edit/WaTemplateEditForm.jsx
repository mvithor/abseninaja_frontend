import {
    Box,
    InputAdornment,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import { IconUser, IconPhone, IconHome } from "@tabler/icons-react";
import Grid from "@mui/material/Grid";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import axiosInstance from "src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const WaTemplateEditForm = ({
    waTemplateData,
    handleChange,
    handleSubmit,
    handleCancel,
    isLoading
}) => {

    const { data: kategoriTemplatelOptions = [], isLoading: isKategoriTemplateLoading } = useQuery({
        queryKey: ["kategoriTemplateOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/template-kategori');
            return response.data.data;
        }
    });
    if (isLoading || isKategoriTemplateLoading) {
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
                    <CustomFormLabel htmlFor="title" sx={{ mt: 3 }}>
                        Judul Template
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="title"
                        name="title"
                        value={waTemplateData.title || ""}
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
                    <CustomFormLabel htmlFor="body" sx={{ mt: 3 }}>
                        Isi Pesan WhatsApp
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="body"
                        name="body"
                        value={waTemplateData.body || ""}
                        onChange={handleChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <IconPhone />
                            </InputAdornment>
                        }
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        placeholder="Contoh: Halo {{name}}, jangan lupa absen hari ini!"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="wa_template_category_id" sx={{ mt: 3 }}>
                        Kategori Template
                    </CustomFormLabel>
                    <CustomSelect
                        id="wa_template_category_id"
                        name="wa_template_category_id"
                        value={waTemplateData.wa_template_category_id || waTemplateData.Category?.id || ""}
                        onChange={handleChange}
                        fullWidth
                    >
                        {kategoriTemplatelOptions.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.nama_kategori}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="description" sx={{ mt: 3 }}>
                        Deskripsi
                    </CustomFormLabel>
                    <CustomOutlinedInput
                        id="description"
                        name="description"
                        value={waTemplateData.description || ""}
                        onChange={handleChange}
                        startAdornment={
                            <InputAdornment position="start">
                                <IconHome />
                            </InputAdornment>
                        }
                        fullWidth
                        placeholder="Contoh: Reminder absen siswa hari ini"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="is_system_template" sx={{ mt: 1.85 }}>Apakah Template Sistem</CustomFormLabel>
                    <CustomSelect
                        id="is_system_template"
                        name="is_system_template"
                        value={waTemplateData.is_system_template}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="">Pilih Status Template</MenuItem>
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
    );
};

export default WaTemplateEditForm;

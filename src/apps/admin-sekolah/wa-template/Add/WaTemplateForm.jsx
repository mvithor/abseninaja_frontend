import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, MenuItem, InputAdornment } from "@mui/material";
import { IconUser } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import axiosInstance from "src/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

// Variabel Dinamis yang Tersedia
const availableVariables = ["{{name}}", "{{kelas}}", "{{tanggal}}", "{{jam}}", "{{sekolah}}"];

const WaTemplateForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState({
        title: '',
        body: '',
        wa_template_category_id: '',
        description: '',
        is_system_template: '',
    });

    const { data: kategoriTemplateOptions = [], isError: kategoriTemplateError } = useQuery({
        queryKey: ["kategoriTemplateOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/template-kategori');
            return response.data.data
        }
    });

    const mutation = useMutation({
        mutationKey: ["tambahWaTemplate"],
        mutationFn: async (newWaTemplate) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/wa-template', newWaTemplate);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate("/dashboard/admin-sekolah/wa-template"), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan template WhatsApp";
            if (errorDetails.length > 0) {
                setError(errorDetails.join(", "));
            } else {
                setError(errorMsg);
            }
            setSuccess("");
        },
        onSettled: () => {
            setTimeout(() => {
                setLoading(false);
                setError("");
                setSuccess("");
            }, 3000);
        },
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const preparedData = {
            ...formState,
            is_system_template: formState.is_system_template === 'true' ? true : false,
        };
        mutation.mutate(preparedData);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (kategoriTemplateError) {
        return <div>Error loading data...</div>;
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="title" sx={{ mt: 1.85 }}>Nama Template</CustomFormLabel>
                    <CustomOutlinedInput
                        id="title"
                        name="title"
                        value={formState.title}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="body" sx={{ mt: 1.85 }}>Pesan WhatsApp</CustomFormLabel>
                    <CustomOutlinedInput
                        id="body"
                        name="body"
                        placeholder="Contoh: Hai {{name}}, jangan lupa absen hari ini!"
                        value={formState.body}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                        fullWidth
                        required
                        multiline
                        minRows={3}
                    />
                    {/* Tambahan Variabel Tersedia */}
                    <Box sx={{ mt: 1 }}>
                        <small>
                            <strong>Variabel yang tersedia:</strong> {availableVariables.map((variable, index) => (
                                <code key={index} style={{ marginRight: 8 }}>{variable}</code>
                            ))}
                        </small>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="wa_template_category_id" sx={{ mt: 1.85 }}>Kategori Pesan</CustomFormLabel>
                    <CustomSelect
                        id="wa_template_category_id"
                        name="wa_template_category_id"
                        value={formState.wa_template_category_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Kategori Template" }}
                    >
                         <MenuItem value="" disabled>
                                Pilih Kategori Template
                            </MenuItem>
                            {kategoriTemplateOptions.map((kategoriTemplateOption) => (
                            <MenuItem key={kategoriTemplateOption.id} value={kategoriTemplateOption.id}>
                                {kategoriTemplateOption.nama_kategori}
                            </MenuItem>
                            ))}
                        
                    </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="description" sx={{ mt: 1.85 }}>Deskripsi Singkat</CustomFormLabel>
                    <CustomOutlinedInput
                        id="description"
                        name="description"
                        placeholder="Contoh: Reminder absen siswa"
                        value={formState.description}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="is_system_template" sx={{ mt: 1.85 }}>Apakah Template Sistem</CustomFormLabel>
                    <CustomSelect
                        id="is_system_template"
                        name="is_system_template"
                        value={formState.is_system_template}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="">Pilih Status Template</MenuItem>
                        <MenuItem value="true">Iya</MenuItem>
                        <MenuItem value="false">Tidak</MenuItem>
                    </CustomSelect>
                </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 2 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default WaTemplateForm;

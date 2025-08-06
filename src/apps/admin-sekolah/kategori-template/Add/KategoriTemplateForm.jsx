import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment } from "@mui/material";
import Grid from '@mui/material/Grid';
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconCategory, IconFileDescription } from '@tabler/icons-react'; 
import { useMutation } from '@tanstack/react-query';
import axiosInstance from "src/utils/axiosInstance";

const TambahKategoriTemplateForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState({
        nama_kategori: '',
        deskripsi: ''
    });

    const mutation = useMutation({
        mutationKey: ["tambahKategori"],
        mutationFn: async (newTemplateKategori) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/template-kategori', newTemplateKategori);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate('/dashboard/admin-sekolah/kategori-template'), 3000)
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan kategori template';
            if (errorDetails.length > 0) {
                setError(errorDetails.join(', '));
            } else {
                setError(errorMsg);
            }
            setSuccess('');
            setTimeout(() => setError(''), 3000); 
        },
        onSettled: () => {
            setTimeout(() => {
                setLoading(false);
                setError("");
                setSuccess("");
            }, 3000);
        }
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
        mutation.mutate(formState);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="nama_kategori" sx={{ mt: 1.85 }}>Nama Kategori Template</CustomFormLabel>
                    <CustomOutlinedInput
                        startAdornment={<InputAdornment position="start"><IconCategory/></InputAdornment>}
                        id="nama_kategori"
                        name="nama_kategori"
                        value={formState.nama_kategori}
                        onChange={handleChange}
                        placeholder="Masukkan Kategori Template"
                        fullWidth
                        required
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="deskripsi" sx={{ mt: 1.85 }}>Deskripsi</CustomFormLabel>
                    <CustomOutlinedInput
                        id="deskripsi"
                        name="deskripsi"
                        value={formState.deskripsi}
                        onChange={handleChange}
                        startAdornment={<InputAdornment position="start"><IconFileDescription/></InputAdornment>}
                        placeholder="Masukkan Deskripsi Template"
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default TambahKategoriTemplateForm;
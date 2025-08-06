import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment } from "@mui/material";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBuilding } from '@tabler/icons-react'; 
import { useMutation } from '@tanstack/react-query';
import axiosInstance from "src/utils/axiosInstance";

const KategoriWaktuForm = ({ setSuccess, setError }) => {
    const [namaKategoriWaktu, setNamaKategoriWaktu] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (newKategoriWaktu) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/kategori-waktu', {
                nama_kategori: newKategoriWaktu
            });
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate('/dashboard/admin-sekolah/kategori-waktu'), 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan kategori waktu';
            const errorDetails = error.response?.data?.errors || [];
            if (errorDetails.length > 0) {
                setError(errorDetails.map(err => err.message).join(', '));  
            } else {
                setError(errorMsg);
            }
            setSuccess('');
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
        setNamaKategoriWaktu(event.target.value);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!namaKategoriWaktu) {
            setError("Kategori Waktu tidak boleh kosong");
            return;
        }
        mutation.mutate(namaKategoriWaktu);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
            <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="namaKategoriWaktu" sx={{ mt: 1.85 }}>
                        Kategori Waktu
                    </CustomFormLabel>
                    </Box>
                    <CustomOutlinedInput
                        startAdornment={<InputAdornment position="start"><IconBuilding/></InputAdornment>}
                        id="namaKategoriWaktu"
                        name="namaKategoriWaktu"
                        value={namaKategoriWaktu}
                        onChange={handleChange}
                        placeholder="Masukkan Kategori Waktu"
                        fullWidth
                        required
                    />
                </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 2 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );    
};

export default KategoriWaktuForm;
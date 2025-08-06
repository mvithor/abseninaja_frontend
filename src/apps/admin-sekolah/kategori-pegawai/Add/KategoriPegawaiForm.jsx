import Grid from "@mui/material/Grid";
import { useState } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconIdBadge2 } from '@tabler/icons-react'; 
import { useMutation } from '@tanstack/react-query';

const TambahKategoriPegawaiForm = ({ setSuccess, setError }) => {
    const [namaKategori, setNamaKategori] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (newKategori) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/kategori-pegawai', {
                nama_kategori: newKategori
            });
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate('/dashboard/admin-sekolah/kategori-pegawai'), 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan kategori pegawai';
            const errorDetails = error.response?.data?.error || [];
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
        setNamaKategori(event.target.value);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!namaKategori) {
            setError("Nama kategori tidak boleh kosong");
            return;
        }
        mutation.mutate(namaKategori);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
            <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="namaKategori" sx={{ mt: 1.85 }}>
                        Kategori Pegawai
                    </CustomFormLabel>
                    </Box>
                    <CustomOutlinedInput
                        startAdornment={<InputAdornment position="start"><IconIdBadge2 /></InputAdornment>}
                        id="namaKategori"
                        name="namaKategori"
                        value={namaKategori}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default TambahKategoriPegawaiForm;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment } from "@mui/material";
import Grid from "@mui/material/Grid";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBookmarks } from '@tabler/icons-react'; 
import { useMutation } from '@tanstack/react-query';
import axiosInstance from "src/utils/axiosInstance";

const TambahTingkatForm = ({ setSuccess, setError }) => {
    const [namaTingkat, setNamaTingkat] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (newTingkat) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/tingkat', {
                nama_tingkat: newTingkat
            });
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate('/dashboard/admin-sekolah/tingkat'), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = errorDetails.length > 0 
                ? errorDetails.join(', ') 
                : error.response?.data?.msg || 'Terjadi kesalahan';
            setError(errorMsg)
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
        setNamaTingkat(event.target.value)
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!namaTingkat) {
            setError("Nama tingkat kelas tidak boleh kosong");
            return;
        }
        mutation.mutate(namaTingkat);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
        <Grid container spacing={2} rowSpacing={1}>
        <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center">
                <CustomFormLabel htmlFor="namaTingkat" sx={{ mt: 1.85 }}>
                    Tingkatan Kelas
                </CustomFormLabel>
                </Box>
                    <CustomOutlinedInput
                        startAdornment={<InputAdornment position="start"><IconBookmarks /></InputAdornment>}
                        id="namaTingkat"
                        name="namaTingkat"
                        value={namaTingkat}
                        onChange={handleChange}
                        placeholder="7,8,9,10,11,12/VII,VIII,IX,X,XI,XII"
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

export default TambahTingkatForm;
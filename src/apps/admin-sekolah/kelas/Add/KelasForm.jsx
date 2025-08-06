import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  InputAdornment,
  MenuItem
} from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconBuilding } from '@tabler/icons-react'; 
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from "src/utils/axiosInstance";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";

const TambahKelasForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState({
        nama_kelas: '',
        tingkat_id: '',
    });

    // Fetch Tingkat Options
    const { data: tingkatOptions = [], isError: tingkatError } = useQuery({
        queryKey: ["kelasOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/tingkat');
            return response.data.data;
        }
    });

    const mutation = useMutation({
        mutationKey: ["tambahKelas"],
        mutationFn: async (newKelas) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/kelas', newKelas);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate('/dashboard/admin-sekolah/kelas'), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan kelas';
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

    if (tingkatError) {
        return <div>Error Loading Data...</div>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="nama_kelas" sx={{ mt: 1.85}}>Nama Kelas</CustomFormLabel>
                    <CustomOutlinedInput
                        id="nama_kelas"
                        name="nama_kelas"
                        value={formState.nama_kelas}
                        onChange={handleChange}
                        placeholder="Masukkan Nama Kelas"
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
                        value={formState.tingkat_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Tingkat" }}
                    >
                        <MenuItem value="" disabled>
                            Pilih Tingkat
                        </MenuItem>
                        {tingkatOptions.map((tingkat) => (
                            <MenuItem key={tingkat.id} value={tingkat.id}>
                                {tingkat.nama_tingkat}
                            </MenuItem>
                        ))}
                    </CustomSelect>
                </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default TambahKelasForm;
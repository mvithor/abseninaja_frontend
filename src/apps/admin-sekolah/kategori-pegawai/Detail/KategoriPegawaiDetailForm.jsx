import Grid from "@mui/material/Grid";
import { useState } from "react";
import axiosInstance from "src/utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { Box, InputAdornment } from "@mui/material";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import { IconIdBadge2 } from '@tabler/icons-react'; 
import { useMutation } from '@tanstack/react-query';

const TambahKategoriPegawaiDetailForm = ({ setSuccess, setError }) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [namaSubkategori, setNamaSubkategori] = useState(""); 
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (newSubKategori) => {
            const response = await axiosInstance.post(`/api/v1/admin-sekolah/kategori-pegawai/${id}/subkategori`, newSubKategori);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate(`/dashboard/admin-sekolah/kategori-pegawai/detail/${id}`), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || [];
            const errorMsg = error.response?.data?.msg || "Terjadi kesalahan saat menambahkan subkategori";
            if (errorDetails.length > 0) {
                setError(errorDetails.join(", "));
            } else {
                setError(errorMsg);
            }
            setSuccess("");
            setLoading(false);
            setTimeout(() => setError(""), 3000);
        },
    });

    const handleChange = (event) => {
        setNamaSubkategori(event.target.value);
    };

    const handleCancel = () => {
        navigate(-1); 
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!namaSubkategori.trim()) {
            setError("Nama Subkategori tidak boleh kosong");
            return;
        };

        mutation.mutate({
            nama_subkategori: namaSubkategori,
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -5}}>
             <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12 }}>
                    <Box display="flex" alignItems="center">
                        <CustomFormLabel htmlFor="namaSubkategori" sx={{ mt: 1.85 }}>
                            Sub Kategori Pegawai
                        </CustomFormLabel>
                    </Box>
                    <CustomOutlinedInput
                        startAdornment={
                            <InputAdornment position="start">
                                <IconIdBadge2 />
                            </InputAdornment>
                        }
                        id="namaSubkategori"
                        name="namaSubkategori"
                        value={namaSubkategori}
                        onChange={handleChange}
                        placeholder= "Ilmu Pengetahuan Alam"
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

export default TambahKategoriPegawaiDetailForm;

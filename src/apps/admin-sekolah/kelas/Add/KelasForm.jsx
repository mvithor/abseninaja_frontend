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

const sanitizeForNamaKelas = (text) => (text || "").replace(/[^a-zA-Z0-9\s]/g, "").trim();

const TambahKelasForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [namaKelasTouched, setNamaKelasTouched] = useState(false);
    const [formState, setFormState] = useState({
        nama_kelas: '',
        tingkat_id: '',
        jurusan_id: '',
    });

    const { data: tingkatOptions = [], isError: tingkatError } = useQuery({
        queryKey: ["kelasOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/tingkat');
            return response.data.data;
        }
    });

    const { data: fiturStatus } = useQuery({
        queryKey: ["jurusanFiturStatus"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/jurusan/fitur-status');
            return response.data;
        },
    });
    const fiturJurusanAktif = fiturStatus?.enabled === true;

    const { data: jurusanOptions = [], isError: jurusanError } = useQuery({
        queryKey: ["jurusanOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/jurusan');
            return response.data.data;
        },
        enabled: fiturJurusanAktif,
    });

    const mutation = useMutation({
        mutationKey: ["tambahKelas"],
        mutationFn: async (newKelas) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/kelas', {
                ...newKelas,
                jurusan_id: newKelas.jurusan_id || null,
            });
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

    const buildSuggestedNamaKelas = (tingkatId, jurusanId) => {
        const tingkat = tingkatOptions.find((t) => String(t.id) === String(tingkatId));
        const jurusan = jurusanOptions.find((j) => String(j.id) === String(jurusanId));
        if (!tingkat || !jurusan) return null;

        const kodeJurusan = sanitizeForNamaKelas(jurusan.kode_lokal || jurusan.nama);
        if (!kodeJurusan) return null;

        const suggestion = `${tingkat.nama_tingkat} ${kodeJurusan}`.replace(/\s+/g, ' ').trim().slice(0, 10);
        return suggestion || null;
    };

    const handleNamaKelasChange = (event) => {
        setNamaKelasTouched(true);
        setFormState((prev) => ({ ...prev, nama_kelas: event.target.value }));
    };

    const handleTingkatOrJurusanChange = (event) => {
        const { name, value } = event.target;
        setFormState((prev) => {
            const next = { ...prev, [name]: value };
            if (fiturJurusanAktif && !namaKelasTouched) {
                const suggestion = buildSuggestedNamaKelas(next.tingkat_id, next.jurusan_id);
                if (suggestion) next.nama_kelas = suggestion;
            }
            return next;
        });
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
                        onChange={handleNamaKelasChange}
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
                        onChange={handleTingkatOrJurusanChange}
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

                {fiturJurusanAktif && (
                    <Grid size={{ xs: 12, md: 6 }}>
                        <CustomFormLabel htmlFor="jurusan_id" sx={{ mt: 1.85 }}>Jurusan</CustomFormLabel>
                        <CustomSelect
                            id="jurusan_id"
                            name="jurusan_id"
                            value={formState.jurusan_id}
                            onChange={handleTingkatOrJurusanChange}
                            fullWidth
                            required
                            displayEmpty
                            inputProps={{ "aria-label": "Pilih Jurusan" }}
                        >
                            <MenuItem value="" disabled>
                                Pilih Jurusan
                            </MenuItem>
                            {jurusanError && (
                                <MenuItem value="" disabled>
                                    Gagal memuat daftar jurusan
                                </MenuItem>
                            )}
                            {!jurusanError && jurusanOptions.length === 0 && (
                                <MenuItem value="" disabled>
                                    Belum ada jurusan — tambah jurusan dulu
                                </MenuItem>
                            )}
                            {jurusanOptions.map((jurusan) => (
                                <MenuItem key={jurusan.id} value={jurusan.id}>
                                    {jurusan.nama}
                                </MenuItem>
                            ))}
                        </CustomSelect>
                    </Grid>
                )}
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default TambahKelasForm;
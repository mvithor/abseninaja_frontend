import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  MenuItem,
  InputAdornment,
  IconButton
} from "@mui/material";
import { IconUser, IconMail, IconLock, IconIdBadge2 } from "@tabler/icons-react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import CustomSelect from "src/components/forms/theme-elements/CustomSelect";
import axiosInstance from "src/utils/axiosInstance";

const TambahSiswaForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        password: '',
        kelas_id: '',
        nis: '',
        tanggal_lahir: '',
    });

    // fetch kelas
    const { data: kelasOptions = [], isError: kelasError } = useQuery({
        queryKey: ["kelasOptions"],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/v1/admin-sekolah/dropdown/kelas');
            return response.data.data;
        }
    });

    const mutation = useMutation({
        mutationKey: ["tambahSiswa"],
        mutationFn: async (newSiswa) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/siswa', newSiswa);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate("/dashboard/admin-sekolah/siswa"), 3000);
        },
        onError: (error) => {
            const errorDetails = error.response?.data?.errors || []; 
            const errorMsg = error.response?.data?.msg || 'Terjadi kesalahan saat menambahkan data siswa';
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

    const handleDateChange = (date) => {
        setFormState((prevState) => ({
            ...prevState,
            tanggal_lahir: date
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(formState);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (kelasError) {
        return <div>Error loading data...</div>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -4 }}>
            <Grid container spacing={2} rowSpacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="name" sx={{ mt: 1.85 }}>Nama Siswa</CustomFormLabel>
                        <CustomOutlinedInput
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                            fullWidth
                            required
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="email" sx={{ mt: 1.85 }}>Email</CustomFormLabel>
                        <CustomOutlinedInput
                            id="email"
                            name="email"
                            value={formState.email}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><IconMail /></InputAdornment>}
                            fullWidth
                            required
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="password" sx={{ mt: 1.85 }}>Password</CustomFormLabel>
                        <CustomOutlinedInput
                            id="password"
                            name="password"
                            value={formState.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            startAdornment={<InputAdornment position="start"><IconLock /></InputAdornment>}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="kelas_id" sx={{ mt: 1.85 }}>Kelas</CustomFormLabel>
                    <CustomSelect
                        id="kelas_id"
                        name="kelas_id"
                        value={formState.kelas_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        displayEmpty
                        inputProps={{ "aria-label": "Pilih Kelas" }}
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
                                overflowY: 'auto',
                            },
                            },
                        }}
                        >
                        <MenuItem value="" disabled>
                            Pilih Kelas
                        </MenuItem>
                        {kelasOptions.map((kelasOption) => (
                            <MenuItem key={kelasOption.id} value={kelasOption.id}>
                            {kelasOption.nama_kelas}
                            </MenuItem>
                        ))}
                </CustomSelect>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="nis" sx={{ mt: 1.85 }}>NISN</CustomFormLabel>
                        <CustomOutlinedInput
                            id="nis"
                            name="nis"
                            value={formState.nis}
                            onChange={handleChange}
                            startAdornment={<InputAdornment position="start"><IconIdBadge2 /></InputAdornment>}
                            fullWidth
                            required
                        />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <CustomFormLabel htmlFor="tanggal_lahir" sx={{ mt: 1.85 }}>Tanggal Lahir</CustomFormLabel>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            value={formState.tanggal_lahir || null}
                            onChange={handleDateChange}
                            placeholder="Tanggal Lahir"
                            slotProps={{
                                textField: {
                                fullWidth: true,
                                size: 'medium',
                                required: true,
                                InputProps: {
                                    sx: {
                                    height: '46px', // Atur tinggi agar sama seperti input lain
                                    paddingHorizontal: 0,
                                    },
                                },
                                },
                            }}
                        />
                        </LocalizationProvider>
                </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default TambahSiswaForm;
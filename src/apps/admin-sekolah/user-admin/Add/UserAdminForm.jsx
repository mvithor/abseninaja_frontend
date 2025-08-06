import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, InputAdornment, IconButton } from "@mui/material";
import { IconUser, IconMail, IconLock } from "@tabler/icons-react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import SubmitButton from "src/components/button-group/SubmitButton";
import CancelButton from "src/components/button-group/CancelButton";
import CustomOutlinedInput from "src/components/forms/theme-elements/CustomOutlinedInput";
import CustomFormLabel from "src/components/forms/theme-elements/CustomFormLabel";
import axiosInstance from "src/utils/axiosInstance";

const TambahAdminForm = ({ setSuccess, setError }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        password: '',
    });

    const mutation = useMutation({
        mutationKey: ["tambahAdmin"],
        mutationFn: async (newAdmin) => {
            const response = await axiosInstance.post('/api/v1/admin-sekolah/users/admin', newAdmin);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.msg);
            setError("");
            setTimeout(() => navigate("/dashboard/admin-sekolah/user-admin"), 3000);
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

    const handleSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(formState);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -2 }}>
            <Grid size={{ xs: 12 }}>
                <CustomFormLabel htmlFor="name" sx={{ mt: 1.85 }}>Nama Admin</CustomFormLabel>
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
            <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
            <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 2 }} >
                <SubmitButton isLoading={loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel}>Batal</CancelButton>
            </Box>
        </Box>
    );
};

export default TambahAdminForm;
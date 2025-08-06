import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { IconUser, IconMail, IconLock } from '@tabler/icons-react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import Grid from "@mui/material/Grid";
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomOutlinedInput from 'src/components/forms/theme-elements/CustomOutlinedInput';
import SubmitButton from 'src/components/button-group/SubmitButton';
import CancelButton from 'src/components/button-group/CancelButton';
import axiosInstance from 'src/utils/axiosInstance';

const AdminSekolahForm = ({ setSuccess, setError, nama_admin, email, sekolah_id, isLoading }) => { 
    const [formState, setFormState] = useState({
        password: '',
    });
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const mutation = useMutation({
        mutationKey: ['adminSekolah'],
        mutationFn: async (newAdmin) => {
            const response = await axiosInstance.post(`/api/v1/super-admin/pendaftaran/admin-sekolah`, newAdmin);
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess(data.message);
            setError('');
            setFormState({
                password: '',
            });
            setTimeout(() => navigate('/dashboard/admin/manajemen-sekolah/admin-sekolah'), 3000);
        },
        onError: (error) => {
            const errorMsg = error.response?.data.message || 'Terjadi kesalahan saat menambahkan admin sekolah';
            console.error('Terjadi kesalahan:', errorMsg);
            setError(errorMsg);
            setSuccess('');
        },
        onSettled: () => {
            setTimeout(() => {
                setError("");
                setSuccess("");
            }, 3000);
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({
          ...prevState,
          [name]: value,
        }));
      };
    
    const handleSubmit = (event) => {
        event.preventDefault();
        const newAdminData = {
            password: formState.password,
            sekolah_id: sekolah_id,  
        };
        console.log('Data yang dikirim:', newAdminData);
        mutation.mutate(newAdminData);
    };
    
    
    const handleCancel = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="40px">
                <CircularProgress />
            </Box>
        );
    }


    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: -2 }}>
            <Grid container spacing={2} rowSpacing={1}>
            {/* Field Nama Admin */}
            <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="nama_admin" sx={{ mt: 1.85 }}>
                        Nama Admin
                    </CustomFormLabel>
                </Box>
                <CustomOutlinedInput
                    id="nama_admin"
                    name="nama_admin"
                    value={nama_admin} 
                    readOnly 
                    startAdornment={<InputAdornment position="start"><IconUser /></InputAdornment>}
                    fullWidth
                />
            </Grid>
            {/* Field Email */}
            <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="email" sx={{ mt: 1.85 }}>
                        Email
                    </CustomFormLabel>
                </Box>
                <CustomOutlinedInput
                    id="email"
                    name="email"
                    value={email} 
                    readOnly 
                    startAdornment={<InputAdornment position="start"><IconMail /></InputAdornment>}
                    fullWidth
                />
            </Grid>
            {/* Field Password */}
            <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center">
                    <CustomFormLabel htmlFor="password" sx={{ mt: 1.85 }}>
                        Password Admin
                    </CustomFormLabel>
                </Box>
                <CustomOutlinedInput
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
                    id="password"
                    name="password"
                    value={formState.password}
                    onChange={handleChange}
                    placeholder="Masukkan Password"
                    fullWidth
                    required
                />
            </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4 }}>
                <SubmitButton isLoading={mutation.loading}>Simpan</SubmitButton>
                <CancelButton onClick={handleCancel} />
            </Box>
        </Box>
    );
};

export default AdminSekolahForm;
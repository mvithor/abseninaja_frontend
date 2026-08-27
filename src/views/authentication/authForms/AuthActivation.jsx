import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import axiosInstance from 'src/utils/axiosInstance';
import Alerts from 'src/components/alerts/Alerts';
import { useNavigate, useParams } from 'react-router-dom';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';

const fetchActivationForm = async (token) => {
  const response = await axiosInstance.get(`/api/v1/aktivasi/${token}`);
  return response.data;
};

const AuthActivation = ({ title, subtext }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['activation-form', token],
    queryFn: () => fetchActivationForm(token),
    enabled: !!token,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      // [FIX] Sama seperti di atas — '/api/v1/aktivasi', bukan '/api/v1/activation'.
      const response = await axiosInstance.post('/api/v1/aktivasi', payload);
      return response.data;
    },
    onSuccess: (resData) => {
      setSuccess(resData.msg || 'Akun berhasil diaktivasi. Mengarahkan ke halaman login...');
      setError('');
      setTimeout(() => navigate('/'), 2500);
    },
    onError: (err) => {
      const msg = err.response?.data?.msg || 'Terjadi kesalahan saat aktivasi akun';
      setError(msg);
      setSuccess('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password harus memiliki minimal 6 karakter.');
      return;
    }
    if (password !== confPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    mutation.mutate({ userId: data?.userId, password, token });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <>
        <Typography fontWeight={700} variant="h4" mb={2}>{title}</Typography>
        <Alerts error={queryError?.response?.data?.msg || 'Link aktivasi tidak valid atau sudah kadaluarsa.'} />
      </>
    );
  }

  if (data?.is_activated) {
    return (
      <>
        <Typography fontWeight={700} variant="h4" mb={2}>{title}</Typography>
        <Typography variant="body1">
          Akun ini sudah aktif. Silakan{' '}
          <Typography
            component="span"
            color="primary.main"
            sx={{ cursor: 'pointer', fontWeight: 600 }}
            onClick={() => navigate('/')}
          >
            login di sini
          </Typography>.
        </Typography>
      </>
    );
  }

  return (
    <>
      <Typography fontWeight={700} variant="h4" mb={1}>
        <Alerts error={error} success={success} />
        {title}
      </Typography>
      {subtext}
      <Stack>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <CustomFormLabel>Email</CustomFormLabel>
          <CustomTextField value={data?.email || ''} fullWidth disabled />

          <CustomFormLabel htmlFor="password">Password Baru</CustomFormLabel>
          <CustomTextField
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} onMouseDown={(e) => e.preventDefault()} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <CustomFormLabel htmlFor="confPassword">Konfirmasi Password</CustomFormLabel>
          <CustomTextField
            id="confPassword"
            name="confPassword"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={confPassword}
            onChange={(e) => setConfPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={mutation.isPending}
            sx={{
              mt: 3,
              backgroundColor: '#973BE0',
              '&:hover': { backgroundColor: '#2A85FF' },
            }}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Aktivasi Akun'}
          </Button>
        </Box>
      </Stack>
    </>
  );
};

export default AuthActivation;
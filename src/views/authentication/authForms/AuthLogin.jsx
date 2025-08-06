import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import axiosInstance from 'src/utils/axiosInstance';
import Alerts from 'src/components/alerts/Alerts';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CustomCheckbox from 'src/components/forms/theme-elements/CustomCheckbox';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { setUser, clearUser } from 'src/store/apps/user/userSlice';
import { jwtDecode } from 'jwt-decode';

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId] = useState(`device-${Date.now()}`);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired')) {
      setError('Sesi anda telah berakhir. Silakan login kembali.');
      dispatch(clearUser());
      setTimeout(() => navigate('/'), 5000);
    }
  }, [location.search, dispatch, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('/api/v1/login', {
        email,
        password,
        deviceId,
      });
      const { accessToken } = response.data;
      const decodedToken = jwtDecode(accessToken);
      const { userId, name, role } = decodedToken;

      dispatch(setUser({ name, role, userId, accessToken, deviceId }));

      setSuccess('Login berhasil! Mengarahkan...');
      setTimeout(() => {
        switch (role) {
          case 'super admin':
            navigate('/dashboard/super-admin');
            break;
          case 'admin sekolah':
            navigate('/dashboard/admin-sekolah');
            break;
          default:
            setError('Pengguna tidak valid.');
            dispatch(clearUser());
        }
      }, 2000);
    } catch (error) {
      const msg = error.response?.data?.msg || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(msg);
      dispatch(clearUser());
    }
  };

  return (
    <>
      <Typography fontWeight={700} variant="h4" mb={1}>
        <Alerts error={error} success={success} />
        {title}
      </Typography>
      {subtext}
      <Stack>
        <Box component="form" onSubmit={handleLogin} noValidate>
          <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
          <CustomTextField
            id="email"
            name="email"
            type="email"
            variant="outlined"
            placeholder="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            placeholder="Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={<CustomCheckbox defaultChecked />}
                label="Ingat perangkat ini"
              />
            </FormGroup>
            <Typography
              component={Link}
              to="/auth/forgot-password"
              fontWeight={500}
              sx={{ textDecoration: 'none', color: 'primary.main' }}
            >
              Lupa Password?
            </Typography>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{
              backgroundColor: '#973BE0',
              '&:hover': {
                backgroundColor: '#2A85FF',
              },
            }}
          >
            Masuk
          </Button>
        </Box>
      </Stack>
      {subtitle}
    </>
  );
};

export default AuthLogin;

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
import { Visibility, VisibilityOff, MailOutline, LockOutlined } from '@mui/icons-material';
import { setUser, clearUser } from 'src/store/apps/user/userSlice';
import { jwtDecode } from 'jwt-decode';
import { getDefaultPortal } from 'src/portals/registry';

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId] = useState(`device-${Date.now()}`);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired')) {
      setError('Sesi anda telah berakhir. Silakan login kembali.');
      dispatch(clearUser());
      const timer = setTimeout(() => navigate('/login'), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.search, dispatch, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setSuccess('');

    // Form memakai noValidate, jadi atribut `required` tidak dicek browser.
    // Cek di sini agar tidak mengirim request yang pasti ditolak backend.
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/v1/login', {
        email: email.trim(),
        password,
        deviceId,
      });
      const { accessToken } = response.data;
      const decodedToken = jwtDecode(accessToken);
      const { userId, name, role, isKepalaJurusan, isGuruMapel, personas } = decodedToken;
      
      const portal = getDefaultPortal({ role, personas, isKepalaJurusan, isGuruMapel });
      if (!portal) {
        setError(
          role === 'pegawai'
            ? 'Akun Anda tidak memiliki akses ke dashboard ini.'
            : 'Pengguna tidak valid.',
        );
        dispatch(clearUser());
        setIsSubmitting(false);
        return;
      }

      dispatch(
        setUser({ name, role, userId, accessToken, deviceId, isKepalaJurusan, isGuruMapel, personas }),
      );

      setSuccess('Login berhasil! Mengarahkan...');
      setTimeout(() => navigate(portal.path), 2000);
    } catch (error) {
      const msg = error.response?.data?.msg || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(msg);
      dispatch(clearUser());
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
        {title}
      </Typography>
      {subtext ? (
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>{subtext}</Typography>
      ) : null}

      {(error || success) && <Alerts error={error} success={success} />}

      <Box component="form" onSubmit={handleLogin} noValidate>
        <CustomFormLabel htmlFor="email" sx={{ mt: 0 }}>
          Email
        </CustomFormLabel>
        <CustomTextField
          id="email"
          name="email"
          type="email"
          variant="outlined"
          placeholder="nama@sekolah.sch.id"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutline fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
        <CustomTextField
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          placeholder="Masukkan password Anda"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
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
          disableElevation
          disabled={isSubmitting}
          sx={{
            py: 1.4,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 16,
            background: 'linear-gradient(135deg, #5E5CE6 0%, #2F327D 100%)',
            boxShadow: '0 12px 24px -12px rgba(94, 92, 230, 0.6)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4B49CF 0%, #2A2C6E 100%)',
            },
          }}
        >
          Masuk
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthLogin;
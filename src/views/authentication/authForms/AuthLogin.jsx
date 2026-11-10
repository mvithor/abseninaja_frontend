import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import Alerts from 'src/components/alerts/Alerts';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomCheckbox from 'src/components/forms/theme-elements/CustomCheckbox';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import { Visibility, VisibilityOff, MailOutline, LockOutlined } from '@mui/icons-material';
import { setUser, clearUser } from 'src/store/apps/user/userSlice';
import { jwtDecode } from 'jwt-decode';
import { getDefaultPortal, normalisasiDaftarPersona } from 'src/portals/registry';
import { PESAN_LOGIN, pesanDariGalatLogin, pesanTanpaPortal, tiketGantiSandiDariGalat } from './pesanLogin';
import { PESAN_SANDI } from 'src/apps/auth/sandi';

// Hanya dibutuhkan pada login pertama guru mandiri, jadi tidak ikut bundel halaman login.
const FormGantiSandiAwal = lazy(() => import('src/apps/auth/FormGantiSandiAwal'));

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId] = useState(`device-${Date.now()}`);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tiket sekali pakai dari server saat sandi awal wajib diganti. Sengaja state lokal: tidak masuk Redux persist atau URL.
  const [tiketGanti, setTiketGanti] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired')) {
      setError(PESAN_LOGIN.SESI_BERAKHIR);
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
      setError(PESAN_LOGIN.WAJIB_DIISI);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/v1/login', {
        email: email.trim(),
        password,
        deviceId,
      });
      const { accessToken, daftarPersona } = response.data;
      const decodedToken = jwtDecode(accessToken);
      const { userId, name, role, isKepalaJurusan, isGuruMapel, personas } = decodedToken;
      
      // daftarPersona (dari server) memuat persona yang tidak ada di klaim token, mis. kepala
      // sekolah, waka kurikulum, guru BK. Bila server lama tidak mengirimnya, jatuh ke klaim token.
      const daftar = normalisasiDaftarPersona(daftarPersona);
      const portal = getDefaultPortal({ role, personas, isKepalaJurusan, isGuruMapel, daftarPersona: daftar });
      if (!portal) {
        setError(pesanTanpaPortal(role));
        dispatch(clearUser());
        setIsSubmitting(false);
        return;
      }

      // Pengguna lain bisa masuk di tab yang sama tanpa logout: cache akun sebelumnya tidak boleh terpakai.
      queryClient.clear();
      dispatch(
        setUser({ name, role, userId, accessToken, deviceId, isKepalaJurusan, isGuruMapel, personas, daftarPersona: daftar }),
      );

      setSuccess('Login berhasil! Mengarahkan...');
      setTimeout(() => navigate(portal.path), 2000);
    } catch (error) {
      dispatch(clearUser());
      setIsSubmitting(false);
      // Sandi awal belum diganti: server tidak menerbitkan sesi, hanya tiket untuk form ganti sandi.
      const tiket = tiketGantiSandiDariGalat(error);
      if (tiket) {
        setPassword('');
        setTiketGanti(tiket);
        return;
      }
      setError(pesanDariGalatLogin(error));
    }
  };

  const kembaliKeMasuk = ({ pesanSukses = '', pesanGalat = '' } = {}) => {
    setTiketGanti(null);
    setPassword('');
    setSuccess(pesanSukses);
    setError(pesanGalat);
  };

  if (tiketGanti) {
    return (
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        }
      >
        <FormGantiSandiAwal
          tiket={tiketGanti}
          onSelesai={() => kembaliKeMasuk({ pesanSukses: PESAN_SANDI.SUKSES_AWAL })}
          onTiketHabis={(pesan) => kembaliKeMasuk({ pesanGalat: pesan })}
          onBatal={() => kembaliKeMasuk()}
        />
      </Suspense>
    );
  }

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
          placeholder="Masukkan password"
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

        <FormGroup sx={{ my: 1 }}>
          <FormControlLabel
            control={<CustomCheckbox defaultChecked />}
            label="Ingat perangkat ini"
          />
        </FormGroup>

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
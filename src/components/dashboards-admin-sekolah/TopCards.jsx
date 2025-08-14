import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

const fetchJumlahSiswa = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/statistik/siswa');
  return response.data.data;
};

const fetchJumlahKelas = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/statistik/kelas');
  return response.data.data;
};

const fetchJumlahGuru = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/statistik/guru');
  return response.data.data;
};

const fetchJumlahStaf = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/statistik/staf');
  return response.data.data;
};

const fetchJumlahEkskul = async () => {
  const response = await axiosInstance.get('/api/v1/admin-sekolah/statistik/ekskul');
  return response.data.data;
};

const TopCards = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { data: jumlahSiswa, isLoading: isLoadingSiswa, isError: isErrorSiswa, error: errorSiswa } = useQuery({
    queryKey: ['jumlahSiswa'],
    queryFn: fetchJumlahSiswa,
  });

  const { data: jumlahKelas, isLoading: isLoadingKelas, isError: isErrorKelas, error: errorKelas } = useQuery({
    queryKey: ['jumlahKelas'],
    queryFn: fetchJumlahKelas,
  });

  const { data: jumlahGuru, isLoading: isLoadingGuru, isError: isErrorGuru, error: errorGuru } = useQuery({
    queryKey: ['jumlahGuru'],
    queryFn: fetchJumlahGuru,
  });

  const { data: jumlahStaf, isLoading: isLoadingStaf, isError: isErrorStaf, error: errorStaf } = useQuery({
    queryKey: ['jumlahStaf'],
    queryFn: fetchJumlahStaf,
  });

  const { data: jumlahEkskul, isLoading: isLoadingEkskul, isError: isErrorEkskul, error: errorEkskul } = useQuery({
    queryKey: ['jumlahEkskul'],
    queryFn: fetchJumlahEkskul,
  });

  const cards = [
    { href: '/dashboard/admin-sekolah/siswa', title: 'Siswa', digits: jumlahSiswa || '0' },
    { href: '/dashboard/admin-sekolah/kelas', title: 'Kelas', digits: jumlahKelas || '0' },
    { href: '/dashboard/admin-sekolah/pegawai/guru', title: 'Guru', digits: jumlahGuru || '0' },
    { href: '/dashboard/admin-sekolajh/pegawai/staf', title: 'Staf', digits: jumlahStaf || '0' },
    { href: '/dashboard/admin-sekolah/ekskul', title: 'Ekskul', digits: jumlahEkskul || '0' },
  ];

  const isLoading = isLoadingSiswa || isLoadingKelas || isLoadingGuru || isLoadingStaf || isLoadingEkskul;
  const isError = isErrorSiswa || isErrorKelas || isErrorGuru || isErrorStaf || isErrorEkskul;
  const errorMessage =
    errorSiswa?.message ||
    errorKelas?.message ||
    errorGuru?.message ||
    errorStaf?.message ||
    errorEkskul?.message ||
    'Gagal memuat data statistik';

  return (
    <Grid container spacing={2} columns={12} mt={0}>
      {isLoading ? (
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100px',
            }}
          >
            <CircularProgress />
          </Box>
        </Grid>
      ) : isError ? (
        <Grid size={{ xs: 12 }}>
          <Typography color="error" align="center">
            {errorMessage}
          </Typography>
        </Grid>
      ) : (
        cards.map((card, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: '8px',
                backgroundColor: isDarkMode
                  ? theme.palette.action.hover
                  : theme.palette.background.paper,
                height: '70px',
                boxShadow: theme.shadows[1],
                border: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  {card.digits}
                </Typography>
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  height: '40px',
                  mx: 2,
                  borderColor: theme.palette.divider,
                }}
              />
              <IconButton
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '8px',
                  color: theme.palette.primary.contrastText,
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                component={Link}
                to={card.href}
              >
                <Add sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default TopCards;

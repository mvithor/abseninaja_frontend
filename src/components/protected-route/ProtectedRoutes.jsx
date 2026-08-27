import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import axiosInstance from 'src/utils/axiosInstance';

const ProtectedRoute = ({ allowedRoles, requireKepalaJurusan = false, requireJurusanFiturAktif = false }) => {
  const { role, accessToken, isKepalaJurusan } = useSelector((state) => state.user);

  const { data: jurusanFiturStatus, isLoading: isFiturStatusLoading } = useQuery({
    queryKey: ['jurusan-fitur-status'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/jurusan/fitur-status');
      return response.data;
    },
    enabled: requireJurusanFiturAktif && role === 'admin sekolah' && Boolean(accessToken),
  });

  if (!accessToken) {
    // Jika tidak ada token, arahkan ke halaman login
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(role)) {
    // Jika role tidak diizinkan, arahkan ke halaman forbidden
    return <Navigate to="/forbidden" />;
  }

  if (requireKepalaJurusan && !isKepalaJurusan) {
    return <Navigate to="/forbidden" />;
  }

  if (requireJurusanFiturAktif) {
    if (isFiturStatusLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }
    if (!jurusanFiturStatus?.enabled) {
      return <Navigate to="/forbidden" />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
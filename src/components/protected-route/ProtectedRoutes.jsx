import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import axiosInstance from 'src/utils/axiosInstance';
import isTokenExpired from 'src/utils/isTokenExpired';
import { canAccessPortal, hasPersona, PERSONA, tujuanSaatDitolak } from 'src/portals/registry';

const ProtectedRoute = ({ allowedRoles, requireKepalaJurusan = false, requireGuruMapel = false, requirePortal = null, requireJurusanFiturAktif = false }) => {
  const user = useSelector((state) => state.user);
  const { pathname } = useLocation();
  const { role, accessToken } = user;
  const tokenExpired = isTokenExpired(accessToken);

  const { data: jurusanFiturStatus, isLoading: isFiturStatusLoading } = useQuery({
    queryKey: ['jurusan-fitur-status'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/admin-sekolah/jurusan/fitur-status');
      return response.data;
    },
    // Tidak menembak API dengan token kosong atau kedaluwarsa
    enabled: requireJurusanFiturAktif && role === 'admin sekolah' && !tokenExpired,
  });

  if (!accessToken) {
    // Jika tidak ada token, arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  if (tokenExpired) {
    // Sesi kedaluwarsa yang tersimpan di localStorage: jangan tampilkan halaman,
    // kirim ke login dengan penanda expired agar AuthLogin membersihkan state.
    return <Navigate to="/login?expired=true" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Jika role tidak diizinkan, arahkan ke halaman forbidden
    return <Navigate to="/forbidden" replace />;
  }

  // Prop lama dipertahankan agar rute yang belum dimigrasi tetap berfungsi,
  // tapi kini membaca sumber yang sama dengan requirePortal (registri persona).
  // Kehilangan persona tertentu (mis. dicabut admin sekolah) tidak berarti akun rusak: bila masih
  // punya portal lain, arahkan ke sana. Hanya tanpa portal sama sekali yang berakhir di /forbidden.
  if (requireKepalaJurusan && !hasPersona(user, PERSONA.KEPALA_JURUSAN)) {
    return <Navigate to={tujuanSaatDitolak(user, pathname)} replace />;
  }

  if (requireGuruMapel && !hasPersona(user, PERSONA.GURU_MAPEL)) {
    return <Navigate to={tujuanSaatDitolak(user, pathname)} replace />;
  }

  if (requirePortal && !canAccessPortal(user, requirePortal)) {
    return <Navigate to={tujuanSaatDitolak(user, pathname)} replace />;
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
      return <Navigate to="/forbidden" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'src/utils/axiosInstance';
import { persistor } from 'src/store/Store';
import { clearUser } from 'src/store/apps/user/userSlice';
import isTokenExpired from 'src/utils/isTokenExpired';

// Satu-satunya jalur logout untuk seluruh layout.
// Pembersihan sesi LOKAL selalu dijalankan, apa pun hasil panggilan ke server,
// supaya tombol Logout tidak pernah macet ketika sesi di server sudah tidak ada.
const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { accessToken, deviceId } = useSelector((state) => state.user);

  return useCallback(async () => {
    if (accessToken && !isTokenExpired(accessToken)) {
      try {
        await axiosInstance.delete('/api/v1/logout', {
          headers: deviceId ? { 'x-device-id': deviceId } : {},
          timeout: 5000,
        });
      } catch (error) {
        console.error('Logout di server gagal, sesi lokal tetap dibersihkan:', error?.message || error);
      }
    }

    queryClient.clear();
    dispatch(clearUser());
    await persistor.purge();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login', { replace: true });
  }, [accessToken, deviceId, dispatch, navigate, queryClient]);
};

export default useLogout;